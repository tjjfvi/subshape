import { ByteLen, Codec } from "/common.ts";
import { encodePositiveBigIntInto } from "/int.ts";
import { u16, u32, u8 } from "/int.ts";

const MAX_U8 = 2 ** (8 - 2) - 1;
const MAX_U16 = 2 ** (16 - 2) - 1;
const MAX_U32 = 2 ** (32 - 2) - 1;

export const compact = new Codec<number | bigint>(
  (value) => {
    if (value <= MAX_U8) {
      return ByteLen._1;
    }
    if (value <= MAX_U16) {
      return ByteLen._2;
    }
    if (value <= MAX_U32) {
      return ByteLen._4;
    }
    let count = 0;
    let asBigInt = BigInt(value);
    while (asBigInt > 0) {
      count++;
      asBigInt >>= 8n;
    }
    return ByteLen._1 + count;
  },
  (cursor, value) => {
    if (value <= MAX_U8) {
      cursor.u8a[cursor.i++] = Number(value) << 2;
      return;
    }
    if (value <= MAX_U16) {
      u16._e(cursor, Number((BigInt(value) << 2n) + 0b01n));
      return;
    }
    if (value <= MAX_U32) {
      u32._e(cursor, Number((BigInt(value) << 2n) + 0b10n));
      return;
    }
    const bytesLength = encodePositiveBigIntInto(BigInt(value), cursor.u8a, cursor.i + 1, Infinity);
    cursor.u8a[cursor.i] = ((bytesLength - 4) << 2) + 0b11;
    cursor.i += ByteLen._1 + bytesLength;
  },
  (cursor) => {
    const b = u8._d(cursor);
    switch ((b & 3) as 0 | 1 | 2 | 3) {
      case 0: {
        return b >> 2;
      }
      case 1: {
        return (b >> 2) + u8._d(cursor) * 2 ** 6;
      }
      case 2: {
        return (b >> 2) + u8._d(cursor) * 2 ** 6 + u8._d(cursor) * 2 ** 14
          + u8._d(cursor) * 2 ** 22;
      }
      case 3: {
        const decodedU32 = u32._d(cursor);
        let len = b >> 2;
        switch (len) {
          case 0: {
            return decodedU32;
          }
          case 1: {
            return decodedU32 + u8._d(cursor) * 2 ** 32;
          }
          case 2: {
            return decodedU32 + u8._d(cursor) * 2 ** 32 + u8._d(cursor) * 2 ** 40;
          }
        }
        let decodedU32AsBigint = BigInt(decodedU32);
        let base = 32n;
        while (len--) {
          decodedU32AsBigint += BigInt(u8._d(cursor)) << base;
          base += 8n;
        }
        return decodedU32AsBigint;
      }
    }
  },
);
