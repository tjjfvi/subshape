import { ByteLen, Decoder, Encoder } from "/common.ts";
import { encodePositiveBigIntInto } from "/int.ts";
import { u16Encoder, u32Decoder, u32Encoder, u8Decoder } from "/int.ts";

/** Decode a compact integer */
export const compactDecoder = new Decoder<number | bigint>((state) => {
  const b = u8Decoder._d(state);
  switch ((b & 3) as 0 | 1 | 2 | 3) {
    case 0: {
      return b >> 2;
    }
    case 1: {
      return (b >> 2) + u8Decoder._d(state) * 2 ** 6;
    }
    case 2: {
      return (b >> 2) + u8Decoder._d(state) * 2 ** 6 + u8Decoder._d(state) * 2 ** 14 + u8Decoder._d(state) * 2 ** 22;
    }
    case 3: {
      const decodedU32 = u32Decoder._d(state);
      let len = b >> 2;
      switch (len) {
        case 0: {
          return decodedU32;
        }
        case 1: {
          return decodedU32 + u8Decoder._d(state) * 2 ** 32;
        }
        case 2: {
          return decodedU32 + u8Decoder._d(state) * 2 ** 32 + u8Decoder._d(state) * 2 ** 40;
        }
      }
      let decodedU32AsBigint = BigInt(decodedU32);
      let base = 32n;
      while (len--) {
        decodedU32AsBigint += BigInt(u8Decoder._d(state)) << base;
        base += 8n;
      }
      return decodedU32AsBigint;
    }
  }
});

const MAX_U8 = 2 ** (8 - 2) - 1;
const MAX_U16 = 2 ** (16 - 2) - 1;
const MAX_U32 = 2 ** (32 - 2) - 1;

/** Encode a compact integer */
export const compactEncoder = new Encoder<bigint | number>(
  (state, value) => {
    if (value <= MAX_U8) {
      state.u8a[state.i++] = Number(value) << 2;
      return;
    }
    if (value <= MAX_U16) {
      u16Encoder._e(state, Number((BigInt(value) << 2n) + 0b01n));
      return;
    }
    if (value <= MAX_U32) {
      u32Encoder._e(state, Number((BigInt(value) << 2n) + 0b10n));
      return;
    }
    const bytesLength = encodePositiveBigIntInto(BigInt(value), state.u8a, state.i + 1, Infinity);
    state.u8a[state.i] = ((bytesLength - 4) << 2) + 0b11;
    state.i += ByteLen._1 + bytesLength;
  },
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
);
