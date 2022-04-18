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

class X128 extends Codec<bigint> {
  constructor(signed: boolean) {
    super(
      () => {
        return 16;
      },
      (cursor, value) => {
        if (value < 0) {
          value = BigInt.asUintN(16 * 8, value);
        }
        encodePositiveBigIntInto(value, cursor.u8a, cursor.i, 16);
        cursor.i += 16;
      },
      (cursor) => {
        let value = 0n;
        for (let i = 0, shift = 0n; i < 16; i += 1, shift += 8n) {
          value += BigInt(cursor.u8a[cursor.i + i]!) << shift;
        }
        if (signed) {
          const isNegative = (cursor.u8a[cursor.i + 16 - 1]! & 0b1000_0000) >> 7 === 1;
          if (isNegative) {
            value = BigInt.asIntN(16 * 8, value);
          }
        }
        cursor.i += 16;
        return value;
      },
    );
  }
}

export const u128 = new X128(false);
export const i128 = new X128(true);

// https://github.com/soramitsu/scale-codec-js-library/blob/master/packages/core/src/codecs/int.ts
export const encodePositiveBigIntInto = (
  value: bigint,
  u8a: Uint8Array,
  i: number,
  limit: number,
): number => {
  let j = 0;
  while (value > 0 && j < limit) {
    u8a[i + j++] = Number(value & 0xffn);
    value >>= 8n;
  }
  return j;
};
