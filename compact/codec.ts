import { Codec, createCodec } from "../common.ts";
import { u16, u32 } from "../int/codec.ts";

const MAX_U8 = 0b00111111;
const MAX_U16 = 0b00111111_11111111;
const MAX_U32 = 0b00111111_11111111_11111111_11111111;

const compactNumber: Codec<number> = createCodec({
  name: "compactNumber",
  _metadata: null,
  _staticSize: 5,
  _encode(buffer, value) {
    if (value <= MAX_U8) {
      buffer.array[buffer.index++] = value << 2;
    } else if (value <= MAX_U16) {
      u16._encode(buffer, (value << 2) | 0b01);
    } else if (value <= MAX_U32) {
      u32._encode(buffer, (value << 2) | 0b10);
    } else {
      buffer.array[buffer.index++] = 0b11;
      u32._encode(buffer, value);
    }
  },
  _decode(buffer) {
    switch (buffer.array[buffer.index]! & 0b11) {
      case 0:
        return buffer.array[buffer.index++]! >> 2;
      case 1:
        return u16._decode(buffer) >> 2;
      case 2:
        return (u32._decode(buffer) - 2) / 4;
      default:
        if (buffer.array[buffer.index++]! !== 3) throw new Error("Out of range for U32");
        return u32._decode(buffer);
    }
  },
});

export const compactU8 = compactNumber;
export const compactU16 = compactNumber;
export const compactU32 = compactNumber;

const compactBigInt: Codec<bigint> = createCodec({
  name: "compactBigInt",
  _metadata: null,
  _staticSize: 5,
  _encode(buffer, value) {
    if (value <= 0xff_ff_ff_ff) {
      compactNumber._encode(buffer, Number(value));
      return;
    }
    let extraBytes = 0;
    let _value = value >> 32n;
    while (_value > 0n) {
      _value >>= 8n;
      extraBytes++;
    }
    buffer.array[buffer.index++] = (extraBytes << 2) | 0b11;
    u32._encode(buffer, Number(value & 0xff_ff_ff_ffn));
    _value = value >> 32n;
    buffer.pushAlloc(extraBytes);
    for (let i = 0; i < extraBytes; i++) {
      buffer.array[buffer.index++] = Number(_value & 0xffn);
      _value >>= 8n;
    }
    buffer.popAlloc();
  },
  _decode(buffer) {
    const b = buffer.array[buffer.index]!;
    if ((b & 0b11) < 3 || b === 3) {
      return BigInt(compactNumber._decode(buffer));
    }
    const extraBytes = b >> 2;
    buffer.index++;
    let value = BigInt(u32._decode(buffer));
    for (let i = 0; i < extraBytes; i++) {
      value |= BigInt(buffer.array[buffer.index++]!) << BigInt(32 + i * 8);
    }
    return value;
  },
});

export const compactU64 = compactBigInt;
export const compactU128 = compactBigInt;
export const compactU256 = compactBigInt;
