export interface Codec<T> {
  name?: string;
  /** Encode a value into a new Uint8Array */
  encode: (value: T) => Uint8Array;
  /** Decode a value from a Uint8Array */
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
      return buf.finish();
    },
    decode(array) {
      const buf = new DecodeBuffer(array);
      return _decode(buf);
    },
  };
}

export type Native<T extends Codec<any>> = T extends Codec<infer U> ? U : never;

export class EncodeBuffer {
  finishedArrays: Uint8Array[] = [];
  finishedSize = 0;
  array: Uint8Array;
  queuedArrays: Uint8Array[] = [];
  view;
  index = 0;

  /** Create a new EncodeBuffer with a specified initial size */
  constructor(size: number) {
    this.array = new Uint8Array(size);
    this.view = new DataView(this.array.buffer);
  }

  /**
   * Insert a Uint8Array at the current position in the buffer.
   * This does not take any of the pre-allocated space.
   */
  insertArray(buffer: Uint8Array) {
    this.finishedArrays.push(this.array.subarray(0, this.index), buffer);
    this.finishedSize += this.index + buffer.length;
    this.array = this.array.subarray(this.index);
    this.view = new DataView(this.array.buffer, this.array.byteOffset, this.array.byteLength);
    this.index = 0;
  }

  /**
   * Allocate more space in the EncodeBuffer.
   * `.pop()` must be called after this space is used.
   */
  pushAlloc(size: number) {
    this.finishedArrays.push(this.array.subarray(0, this.index));
    this.finishedSize += this.index;
    this.queuedArrays.push(this.array.subarray(this.index));
    this.array = new Uint8Array(size);
    this.view = new DataView(this.array.buffer, this.array.byteOffset, this.array.byteLength);
    this.index = 0;
  }

  /**
   * Finishes the current array and resumes writing on the previous array.
   * Must be called after `.push()`.
   */
  popAlloc() {
    this.finishedArrays.push(this.array.subarray(0, this.index));
    this.finishedSize += this.index;
    this.array = this.queuedArrays.pop()!;
    this.view = new DataView(this.array.buffer, this.array.byteOffset, this.array.byteLength);
    this.index = 0;
  }

  /**
   * Finishes the current array, and returns a Uint8Array containing everything written.
   * The EncodeBuffer is left in an undefined state, and should not be used afterwards.
   */
  finish(): Uint8Array {
    if (!this.finishedArrays.length) return this.array.subarray(0, this.index);
    this.finishedArrays.push(this.array.subarray(0, this.index));
    this.finishedSize += this.index;
    const fullArray = new Uint8Array(this.finishedSize);
    let index = 0;
    for (let i = 0; i < this.finishedArrays.length; i++) {
      const array = this.finishedArrays[i]!;
      fullArray.set(array, index);
      index += array.length;
    }
    return fullArray;
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
   * Once Deno releases with TS 4.7, this can be used like so:
   * ```ts
   * visitor.generic((visitor) => <T>() =>
   *   visitor.add($.array<T>, (codec, $el) => {
   *     ...
   *   })
   * )
   * ```
   */
  generic(fn: (visitor: this) => () => void): this {
    fn(this)();
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
