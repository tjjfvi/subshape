import { Codec, Cursor } from "../common.ts";
import { u16, u32, u8 } from "../int/codec.ts";

const MAX_U8 = 2 ** (8 - 2) - 1;
const MAX_U16 = 2 ** (16 - 2) - 1;
const MAX_U32 = 2 ** (32 - 2) - 1;

// https://github.com/soramitsu/scale-codec-js-library/blob/master/packages/core/src/codecs/compact.ts
// TODO: clean this up a bit / simplify
export const compact = new class CompactCodec extends Codec<number | bigint> {
  _size(value: number | bigint) {
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
  }
  _encode(cursor: Cursor, value: number | bigint) {
    if (value <= MAX_U8) {
      cursor.u8a[cursor.i++] = Number(value) << 2;
      return;
    }
    if (value <= MAX_U16) {
      u16._encode(cursor, Number((BigInt(value) << 2n) + 0b01n));
      return;
    }
    if (value <= MAX_U32) {
      u32._encode(cursor, Number((BigInt(value) << 2n) + 0b10n));
      return;
    }
    const bytesLength = encodePositiveBigIntInto(BigInt(value), cursor.u8a, cursor.i + 1, Infinity);
    cursor.u8a[cursor.i] = ((bytesLength - 4) << 2) + 0b11;
    cursor.i += 1 + bytesLength;
  }
  _decode(cursor: Cursor) {
    const b = u8._decode(cursor);
    switch ((b & 3) as 0 | 1 | 2 | 3) {
      case 0: {
        return b >> 2;
      }
      case 1: {
        return (b >> 2) + u8._decode(cursor) * 2 ** 6;
      }
      case 2: {
        return (b >> 2) + u8._decode(cursor) * 2 ** 6 + u8._decode(cursor) * 2 ** 14
          + u8._decode(cursor) * 2 ** 22;
      }
      case 3: {
        const decodedU32 = u32._decode(cursor);
        let len = b >> 2;
        switch (len) {
          case 0: {
            return decodedU32;
          }
          case 1: {
            return decodedU32 + u8._decode(cursor) * 2 ** 32;
          }
          case 2: {
            return decodedU32 + u8._decode(cursor) * 2 ** 32 + u8._decode(cursor) * 2 ** 40;
          }
        }
        let decodedU32AsBigint = BigInt(decodedU32);
        let base = 32n;
        while (len--) {
          decodedU32AsBigint += BigInt(u8._decode(cursor)) << base;
          base += 8n;
        }
        return decodedU32AsBigint;
      }
    }
  }
}();

// TODO: finesse
export const nCompact = compact as any as Codec<number>;

// https://github.com/soramitsu/scale-codec-js-library/blob/master/packages/core/src/codecs/int.ts
const encodePositiveBigIntInto = (
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
