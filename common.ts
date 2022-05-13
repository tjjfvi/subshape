export interface Codec<T> {
  encode: (value: T) => Uint8Array;
  decode: (buffer: Uint8Array) => T;
  _staticSize: number;
  _encode: (buffer: EncodeBuffer, value: T) => void;
  _decode: (buffer: DecodeBuffer) => T;
}

export function createCodec<T>(codec: Pick<Codec<T>, "_staticSize" | "_encode" | "_decode">): Codec<T> {
  const { _staticSize, _encode, _decode } = codec;
  return {
    _staticSize,
    _encode,
    _decode,
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

  constructor(size: number) {
    this.array = new Uint8Array(size);
    this.view = new DataView(this.array.buffer);
  }

  add(buffer: Uint8Array) {
    this.finishedArrays.push(this.array.subarray(0, this.index), buffer);
    this.finishedSize += this.index + buffer.length;
    this.array = this.array.subarray(this.index);
    this.view = new DataView(this.array.buffer, this.array.byteOffset, this.array.byteLength);
    this.index = 0;
  }

  push(size: number) {
    this.finishedArrays.push(this.array.subarray(0, this.index));
    this.finishedSize += this.index;
    this.queuedArrays.push(this.array.subarray(this.index));
    this.array = new Uint8Array(size);
    this.view = new DataView(this.array.buffer, this.array.byteOffset, this.array.byteLength);
    this.index = 0;
  }

  pop() {
    this.finishedArrays.push(this.array.subarray(0, this.index));
    this.finishedSize += this.index;
    this.array = this.queuedArrays.pop()!;
    this.view = new DataView(this.array.buffer, this.array.byteOffset, this.array.byteLength);
    this.index = 0;
  }

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
