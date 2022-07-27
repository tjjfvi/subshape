import { Codec, createCodec } from "../common.ts";
import { u16, u32, u8 } from "../int/codec.ts";

const MAX_U8 = 2 ** (8 - 2) - 1;
const MAX_U16 = 2 ** (16 - 2) - 1;
const MAX_U32 = 2 ** (32 - 2) - 1;

export const compact: Codec<number | bigint> = createCodec({
  name: "compact",
  _metadata: null,
  _staticSize: 4,
  _encode(buffer, value) {
    if (value <= MAX_U8) {
      u8._encode(buffer, Number(value) << 2);
      return;
    }
    if (value <= MAX_U16) {
      u16._encode(buffer, Number((BigInt(value) << 2n) + 0b01n));
      return;
    }
    if (value <= MAX_U32) {
      u32._encode(buffer, Number((BigInt(value) << 2n) + 0b10n));
      return;
    }
    let bytesLength = 0;
    let _value = BigInt(value);
    while (_value > 0n) {
      _value >>= 8n;
      bytesLength++;
    }
    _value = BigInt(value);
    buffer.array[buffer.index++] = ((bytesLength - 4) << 2) + 0b11;
    for (let i = 0; i < bytesLength; i++) {
      if (i === 3) {
        buffer.pushAlloc(bytesLength - 3);
      }
      buffer.array[buffer.index++] = Number(_value & 0xffn);
      _value >>= 8n;
    }
    buffer.popAlloc();
  },
  _decode(buffer) {
    const b = u8._decode(buffer);
    switch ((b & 3) as 0 | 1 | 2 | 3) {
      case 0: {
        return b >> 2;
      }
      case 1: {
        return (b >> 2) + u8._decode(buffer) * 2 ** 6;
      }
      case 2: {
        return (b >> 2) + u8._decode(buffer) * 2 ** 6 + u8._decode(buffer) * 2 ** 14
          + u8._decode(buffer) * 2 ** 22;
      }
      case 3: {
        const decodedU32 = u32._decode(buffer);
        let len = b >> 2;
        switch (len) {
          case 0: {
            return decodedU32;
          }
          case 1: {
            return decodedU32 + u8._decode(buffer) * 2 ** 32;
          }
          case 2: {
            return decodedU32 + u8._decode(buffer) * 2 ** 32 + u8._decode(buffer) * 2 ** 40;
          }
        }
        let decodedU32AsBigint = BigInt(decodedU32);
        let base = 32n;
        while (len--) {
          decodedU32AsBigint += BigInt(u8._decode(buffer)) << base;
          base += 8n;
        }
        return decodedU32AsBigint;
      }
    }
  },
});

// TODO: finesse
export const nCompact = compact as any as Codec<number>;
