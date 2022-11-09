import { Codec, createCodec, metadata } from "../common/mod.ts";
import { compact } from "./compact.ts";
import { u32 } from "./int.ts";

const compactU32 = compact(u32);

export class BitSequence {
  readonly data;

  [index: number]: boolean

  constructor(readonly length = 0, data?: Uint8Array) {
    const byteLength = Math.ceil(length / 8);
    data ??= new Uint8Array(byteLength);
    if (data.length !== byteLength) {
      throw new Error("Incorrectly sized Uint8Array passed to BitSequence constructor");
    }
    this.data = data;
  }

  static from(array: (boolean | 0 | 1)[]) {
    const sequence = new BitSequence(array.length);
    for (let i = 0; i < array.length; i++) {
      sequence._setBit(i, array[i]!);
    }
    return sequence;
  }

  get byteLength() {
    return this.data.length;
  }

  _hasBit(index: number): boolean {
    return 0 <= index && index < this.length && index === Math.floor(index);
  }

  _getBit(index: number): boolean | undefined {
    if (!this._hasBit(index)) return undefined;
    const i = Math.floor(index / 8);
    const j = 7 - index % 8;
    return !!(this.data[i]! & (1 << j));
  }

  _setBit(index: number, bit: boolean | 0 | 1): boolean {
    if (!this._hasBit(index)) return false;
    const i = Math.floor(index / 8);
    const j = 7 - index % 8;
    this.data[i] = this.data[i]! & ~(1 << j) | (+!!bit << j);
    return true;
  }
}

Object.setPrototypeOf(
  BitSequence.prototype,
  new Proxy(Object.prototype, {
    get: (target, k, receiver) => {
      const i = typeof k === "string" ? +k : NaN;
      if (isNaN(i)) return Reflect.get(target, k, receiver);
      return (receiver as BitSequence)._getBit(i);
    },
    set: (target, k, v, receiver) => {
      const i = typeof k === "string" ? +k : NaN;
      if (isNaN(i)) return Reflect.set(target, k, v, receiver);
      return (receiver as BitSequence)._setBit(i, v);
    },
  }),
);

export const bitSequence: Codec<BitSequence> = createCodec({
  _metadata: metadata("$.bitSequence"),
  _staticSize: compactU32._staticSize,
  _encode(buffer, value) {
    compactU32._encode(buffer, value.length);
    buffer.insertArray(value.data);
  },
  _decode(buffer) {
    const length = compactU32._decode(buffer);
    const byteLength = Math.ceil(length / 8);
    return new BitSequence(length, buffer.array.subarray(buffer.index, buffer.index += byteLength));
  },
  _assert(assert) {
    assert.instanceof(this, BitSequence);
  },
});
