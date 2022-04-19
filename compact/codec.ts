import { Codec } from "../common.ts";
import { encodePositiveBigIntInto, u16, u32, u8 } from "../int/codec.ts";

const MAX_U8 = 2 ** (8 - 2) - 1;
const MAX_U16 = 2 ** (16 - 2) - 1;
const MAX_U32 = 2 ** (32 - 2) - 1;

// https://github.com/soramitsu/scale-codec-js-library/blob/master/packages/core/src/codecs/compact.ts
// TODO: clean this up a bit / simplify
export const compact = new Codec<number | bigint>(
  (value) => {
    if (value <= MAX_U8) {
      return 1;
    }
    if (value <= MAX_U16) {
      return 2;
    }
    if (value <= MAX_U32) {
      return 4;
    }
    let count = 0;
    let asBigInt = BigInt(value);
    while (asBigInt > 0) {
      count += 1;
      asBigInt >>= 8n;
    }
    return 1 + count;
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
    cursor.i += 1 + bytesLength;
  },
  (cursor) => {
    const b = u8._d(cursor);
    switch (b & 3) {
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
      default: {
        throw new Error(`Encountered invalid compact mode \`${b}\``);
      }
    }
  },
);

// TODO: finesse
export const nCompact = compact as any as Codec<number>;
