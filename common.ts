export interface Codec<T> {
  name?: string;
  /** Encodes a value into a new Uint8Array (throws if async) */
  encode: (value: T) => Uint8Array;
  /** Asynchronously encodes a value into a new Uint8Array */
  encodeAsync: (value: T) => Promise<Uint8Array>;
  /** Decodes a value from a Uint8Array */
  decode: (buffer: Uint8Array) => T;

  /** [implementation] A static estimation of the size, which may be an under- or over-estimate */
  _staticSize: number;
  /** [implementation] Encodes the value into the supplied buffer */
  _encode: (buffer: EncodeBuffer, value: T) => void;
  /** [implementation] Decodes the value from the supplied buffer */
  _decode: (buffer: DecodeBuffer) => T;

  /**
   * If present, a factory function and the corresponding arguments.
   * `undefined` indicates that this codec is atomic (e.g. `$.str`).
   */
  _metadata?: [Function, ...unknown[]];
}

export function createCodec<T, A extends unknown[]>(
  _codec: Pick<Codec<T>, "_encode" | "_decode" | "_staticSize" | "name"> & {
    /**
     * If non-null, the function calling `createCodec` and the corresponding arguments.
     * `null` indicates that this codec is atomic (e.g. `$.str`).
     */
    _metadata: [(...args: A) => Codec<T>, ...A] | null;
  },
): Codec<T> {
  const { _staticSize, _encode, _decode, _metadata, name } = _codec;
  return {
    name,
    _staticSize,
    _encode,
    _decode,
    ..._metadata && { _metadata },
    encode(value) {
      const buf = new EncodeBuffer(_staticSize);
      _encode(buf, value);
      if (buf.asyncCount) throw new Error("Attempted to synchronously encode an async codec");
      return buf.finish();
    },
    async encodeAsync(value) {
      const buf = new EncodeBuffer(_staticSize);
      _encode(buf, value);
      return buf.finishAsync();
    },
    decode(array) {
      const buf = new DecodeBuffer(array);
      return _decode(buf);
    },
  };
}

export function createAsyncCodec<T, A extends unknown[]>(
  _codec: Pick<Codec<T>, "_decode" | "_staticSize" | "name"> & {
    _encodeAsync: (buffer: EncodeBuffer, value: T) => Promise<void>;
    /**
     * If non-null, the function calling `createCodec` and the corresponding arguments.
     * `null` indicates that this codec is atomic (e.g. `$.str`).
     */
    _metadata: [(...args: A) => Codec<T>, ...A] | null;
  },
): Codec<T> {
  const { _staticSize, _encodeAsync, _decode, _metadata, name } = _codec;
  return {
    name,
    _staticSize,
    _encode(buffer, value) {
      buffer.writeAsync(_staticSize, (buf) => _encodeAsync(buf, value));
    },
    _decode,
    ..._metadata && { _metadata },
    encode(_value) {
      throw new Error("Attempted to synchronously encode an async codec");
    },
    async encodeAsync(value) {
      const buf = new EncodeBuffer(_staticSize);
      await _encodeAsync(buf, value);
      return buf.finishAsync();
    },
    decode(array) {
      const buf = new DecodeBuffer(array);
      return _decode(buf);
    },
  };
}

export type Native<T extends Codec<any>> = T extends Codec<infer U> ? U : never;

export class EncodeBuffer {
  finishedArrays: (Uint8Array | EncodeBuffer)[] = [];
  finishedSize = 0;
  queuedArrays: Uint8Array[] = [];
  array!: Uint8Array;
  view!: DataView;
  index = 0;

  asyncCount = 0;
  asyncPromise = Promise.resolve();
  asyncResolve: (value: void | Promise<void>) => void = () => {};

  /** Creates a new EncodeBuffer with a specified initial size/buffer */
  constructor(init: number | Uint8Array) {
    this._setArray(typeof init === "number" ? new Uint8Array(init) : init);
  }

  /**
   * Inserts a Uint8Array at the current position in the buffer.
   * This does not consume any of the pre-allocated space.
   */
  insertArray(buffer: Uint8Array) {
    this._commitWritten();
    this.finishedArrays.push(buffer);
    this.finishedSize += buffer.length;
    if (this.index) {
      this._setArray(this.array.subarray(this.index));
    }
  }

  /**
   * Allocates more space in the EncodeBuffer.
   * `.popAlloc()` must be called after this space is used.
   */
  pushAlloc(size: number) {
    this._commitWritten();
    this.queuedArrays.push(this.array.subarray(this.index));
    this._setArray(new Uint8Array(size));
  }

  /**
   * Finishes the current array and resumes writing on the previous array.
   * Must be called after `.pushAlloc()`.
   */
  popAlloc() {
    this._commitWritten();
    this._setArray(this.queuedArrays.pop()!);
  }

  /**
   * Creates a sub-buffer that can be written into asynchronously.
   * The buffer passed to the callback should not be used after the returned promise resolves.
   */
  writeAsync(length: number, fn: (buffer: EncodeBuffer) => Promise<void>) {
    this.waitFor(async () => {
      const cursor = this.createCursor(length);
      await fn(cursor);
      cursor.close();
    });
  }

  /**
   * Creates a sub-buffer that can be written into later to insert data into the middle of the array.
   * `.close()` must be called after the cursor is done being written into.
   * The cursor should not be used after `.close()` is called.
   * If the cursor will be written into asynchronously, the buffer must be held open with `.waitFor()`.
   */
  createCursor(length: number): EncodeBuffer & { close(): void } {
    this._commitWritten();
    const cursor = Object.assign(
      new EncodeBuffer(this.array.subarray(this.index, this.index + length)),
      {
        close: () => {
          this.waitForBuffer(cursor, () => {
            cursor._commitWritten();
            this.finishedSize += cursor.finishedSize;
          });
        },
      },
    );
    this._setArray(this.array.subarray(this.index + length));
    this.finishedArrays.push(cursor);

    return cursor;
  }

  /**
   * Immediately invokes the callback, and holds the buffer open until the
   * returned promise resolves.
   */
  waitFor(fn: () => Promise<void>) {
    if (!this.asyncCount) {
      this.asyncPromise = new Promise((resolve) => this.asyncResolve = resolve);
    }
    this.asyncCount++;

    fn()
      .then(() => {
        this.asyncCount--;
        if (!this.asyncCount) {
          this.asyncResolve();
        }
      })
      .catch((e) => {
        this.asyncResolve(Promise.reject(e));
      });
  }

  /**
   * Invokes the callback once buffer's async tasks finish, and holds this
   * buffer open until the callback returns.
   */
  waitForBuffer(buffer: EncodeBuffer, fn: () => void) {
    if (buffer.asyncCount) {
      this.waitFor(async () => {
        await buffer.asyncPromise;
        fn();
      });
    } else {
      fn();
    }
  }

  /**
   * Finishes the current array, and returns a Uint8Array containing everything written.
   * The EncodeBuffer is left in an undefined state, and should not be used afterwards.
   * Throws if asynchronous writes are still pending.
   */
  finish(): Uint8Array {
    if (this.asyncCount) throw new Error("Attempted to finish before async completion");
    if (!this.finishedArrays.length) return this.array.subarray(0, this.index);
    this._commitWritten();
    const fullArray = new Uint8Array(this.finishedSize);
    this._finishInto(fullArray, 0);
    return fullArray;
  }

  /**
   * Finishes the current array, and returns a Uint8Array containing everything written.
   * The EncodeBuffer is left in an undefined state, and should not be used afterwards.
   */
  async finishAsync(): Promise<Uint8Array> {
    await this.asyncPromise;
    return this.finish();
  }

  /** Copies all data from finishedArrays into fullArray */
  _finishInto(fullArray: Uint8Array, index: number): number {
    for (let i = 0; i < this.finishedArrays.length; i++) {
      const array = this.finishedArrays[i]!;
      if (array instanceof EncodeBuffer) {
        index = array._finishInto(fullArray, index);
      } else {
        fullArray.set(array, index);
        index += array.length;
      }
    }
    return index;
  }

  /**
   * Pushes the data written in array to finishedArrays.
   * Leaves the buffer in an invalid state -- array and index must be updated.
   */
  _commitWritten() {
    if (this.index) {
      this.finishedArrays.push(this.array.subarray(0, this.index));
      this.finishedSize += this.index;
    }
  }

  /** Sets array and updates view */
  _setArray(array: Uint8Array) {
    this.array = array;
    this.view = new DataView(array.buffer, array.byteOffset, array.byteLength);
    this.index = 0;
  }
}

export class DecodeBuffer {
  view;
  index = 0;
  constructor(public array: Uint8Array) {
    this.view = new DataView(array.buffer);
  }
}

export type Expand<T> = T extends T ? { [K in keyof T]: T[K] } : never;
export type U2I<U> = (U extends U ? (u: U) => 0 : never) extends (i: infer I) => 0 ? Extract<I, U> : never;
export type Narrow<T> =
  | (T extends infer U ? U : never)
  | Extract<T, number | string | boolean | bigint | symbol | null | undefined | []>
  | ([T] extends [[]] ? [] : { [K in keyof T]: Narrow<T[K]> });

export class CodecVisitor<R> {
  #fallback?: <T>(codec: Codec<T>) => R;
  #visitors = new Map<Codec<any> | Function, (codec: Codec<any>, ...args: any[]) => R>();

  constructor() {}

  add<T, A extends unknown[]>(codec: (...args: A) => Codec<T>, fn: (codec: Codec<T>, ...args: A) => R): this;
  add<T>(codec: Codec<T>, fn: (codec: Codec<T>) => R): this;
  add(codec: Codec<any> | Function, fn: (codec: Codec<any>, ...args: any[]) => R): this {
    if (this.#visitors.has(codec)) {
      throw new Error("Duplicate visitor");
    }
    this.#visitors.set(codec, fn);
    return this;
  }

  fallback(fn: <T>(codec: Codec<T>) => R): this {
    if (this.#fallback) {
      throw new Error("Duplicate fallback");
    }
    this.#fallback = fn;
    return this;
  }

  /**
   * ```ts
   * visitor.generic(<T>() =>
   *   visitor.add($.array<T>, (codec, $el) => {
   *     ...
   *   })
   * )
   * ```
   */
  generic(fn: (visitor: this) => void): this {
    fn(this);
    return this;
  }

  visit<T>(codec: Codec<T>): R {
    const visitor = this.#visitors.get(codec);
    if (visitor) return visitor(codec);
    if (codec._metadata) {
      const visitor = this.#visitors.get(codec._metadata[0]);
      if (visitor) return visitor(codec, ...codec._metadata.slice(1));
    }
    if (this.#fallback) {
      return this.#fallback(codec);
    }
    throw new Error("Unrecognized codec");
  }
}
