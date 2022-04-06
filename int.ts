import { Codec } from "/common.ts";

class NumCodec<T extends number | bigint> extends Codec<T> {
  constructor(
    readonly len: number,
    readonly setter: (dv: DataView, i: number, value: T) => void,
    readonly getter: (dv: DataView, i: number) => T,
  ) {
    super(
      () => {
        return len;
      },
      (cursor, value) => {
        setter(cursor.view, cursor.i, value);
        cursor.i += len;
      },
      (cursor) => {
        const decoded = getter(cursor.view, cursor.i);
        cursor.i += len;
        return decoded;
      },
    );
  }
}

export const u8 = new NumCodec<number>(
  1,
  (dv, i, value) => dv.setUint8(i, value),
  (dv, i) => dv.getUint8(i),
);

export const i8 = new NumCodec<number>(
  1,
  (dv, i, value) => dv.setInt8(i, value),
  (dv, i) => dv.getInt8(i),
);

export const u16 = new NumCodec<number>(
  2,
  (dv, i, value) => dv.setUint16(i, value, true),
  (dv, i) => dv.getUint16(i, true),
);

export const i16 = new NumCodec<number>(
  2,
  (dv, i, value) => dv.setInt16(i, value, true),
  (dv, i) => dv.getInt16(i, true),
);

export const u32 = new NumCodec<number>(
  4,
  (dv, i, value) => dv.setUint32(i, value, true),
  (dv, i) => dv.getUint32(i, true),
);

export const i32 = new NumCodec<number>(
  4,
  (dv, i, value) => dv.setInt32(i, value, true),
  (dv, i) => dv.getInt32(i, true),
);

export const u64 = new NumCodec<bigint>(
  8,
  (dv, i, value) => dv.setBigUint64(i, value, true),
  (dv, i) => dv.getBigUint64(i, true),
);

export const i64 = new NumCodec<bigint>(
  8,
  (dv, i, value) => dv.setBigInt64(i, value, true),
  (dv, i) => dv.getBigInt64(i, true),
);

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
        for (let i = 0, shift = 0n; i < 16; i++, shift += 8n) {
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
