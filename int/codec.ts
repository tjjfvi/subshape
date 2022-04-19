import { Codec, ValueOf } from "../common.ts";

type NumMethodKeys = ValueOf<{ [K in keyof DataView]: K extends `get${infer N}` ? N : never }>;
type NumMethodVal<K extends NumMethodKeys> = ReturnType<DataView[`get${K}`]>;

class NumCodec<K extends NumMethodKeys> extends Codec<NumMethodVal<K>> {
  constructor(
    len: number,
    key: K,
  ) {
    const setter = DataView.prototype[`set${key}`] as any;
    const getter = DataView.prototype[`get${key}`] as any;
    super(
      () => {
        return len;
      },
      (cursor, value) => {
        setter.call(cursor.view, cursor.i, value, true);
        cursor.i += len;
      },
      (cursor) => {
        const decoded = getter.call(cursor.view, cursor.i, true);
        cursor.i += len;
        return decoded;
      },
    );
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

// https://github.com/unstoppablejs/unstoppablejs/blob/2082bf14d9836e52d282d89921df0d6f76db8eda/packages/scale-ts/src/codecs/i128.ts
class X128 extends Codec<bigint> {
  constructor(signed: boolean) {
    super(
      () => {
        return 16;
      },
      (cursor, value) => {
        cursor.view.setBigInt64(cursor.i, value, true);
        cursor.view[
          signed ? 'setBigInt64' : 'setBigUint64'
        ](cursor.i + 8, value >> 64n, true);
        cursor.i += 16;
      },
      (cursor) => {
        const right = cursor.view.getBigUint64(cursor.i, true);
        const left = cursor.view[
          signed ? 'getBigInt64' : 'getBigUint64'
        ](cursor.i + 8, true);
        cursor.i += 16
        return (left << 64n) | right;
      },
    );
  }
}

export const u128 = new X128(false);
export const i128 = new X128(true);
