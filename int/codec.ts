import { Codec, Cursor, ValueOf } from "../common.ts";

type NumMethodKeys = ValueOf<{ [K in keyof DataView]: K extends `get${infer N}` ? N : never }>;
type NumMethodVal<K extends NumMethodKeys> = ReturnType<DataView[`get${K}`]>;

class NumCodec<K extends NumMethodKeys> extends Codec<NumMethodVal<K>> {
  _minSize: number;
  _encode(cursor: Cursor, value: NumMethodVal<K>) {
    this.setter.call(cursor.view, cursor.i, value, true);
    cursor.i += this._minSize;
  }
  _decode(cursor: Cursor) {
    const decoded = this.getter.call(cursor.view, cursor.i, true);
    cursor.i += this._minSize;
    return decoded;
  }
  readonly setter;
  readonly getter;
  constructor(
    len: number,
    readonly key: K,
  ) {
    super();
    this._minSize = len;
    this.setter = DataView.prototype[`set${key}`] as any;
    this.getter = DataView.prototype[`get${key}`] as any;
  }
}

export const u8 = new NumCodec(1, "Uint8");
export const i8 = new NumCodec(1, "Int8");
export const u16 = new NumCodec(2, "Uint16");
export const i16 = new NumCodec(2, "Int16");
export const u32 = new NumCodec(4, "Uint32");
export const i32 = new NumCodec(4, "Int32");
export const u64 = new NumCodec(8, "BigUint64");
export const i64 = new NumCodec(8, "BigInt64");

// https://github.com/unstoppablejs/unstoppablejs/blob/7022e34f756ccc25e6ed9d4680284455b2ff714b/packages/scale-ts/src/codecs/fixed-width-ints.ts#L59-L74
class X128Codec extends Codec<bigint> {
  constructor(readonly signed: boolean) {
    super();
  }
  _minSize = 16;
  _encode(cursor: Cursor, value: bigint) {
    cursor.view.setBigInt64(cursor.i, value, true);
    cursor.view.setBigInt64(cursor.i + 8, value >> 64n, true);
    cursor.i += 16;
  }
  _decode(cursor: Cursor) {
    const right = cursor.view.getBigUint64(cursor.i, true);
    const left = cursor.view[
      this.signed ? "getBigInt64" : "getBigUint64"
    ](cursor.i + 8, true);
    cursor.i += 16;
    return (left << 64n) | right;
  }
}

export const u128 = new X128Codec(false);
export const i128 = new X128Codec(true);
