import { ByteLen, Decoder, Encoder } from "/common.ts";

class NumDecoder<T extends number | bigint> extends Decoder<T> {
  constructor(
    readonly len: ByteLen,
    readonly getter: (dv: DataView, i: number) => T,
  ) {
    super((state) => {
      const decoded = getter(state.view, state.i);
      state.i += len;
      return decoded;
    });
  }
}

class NumEncoder<T extends number | bigint> extends Encoder<T> {
  constructor(
    readonly len: number,
    readonly setter: (dv: DataView, i: number, value: T) => void,
  ) {
    super(
      (state, value) => {
        setter(state.view, state.i, value);
        state.i += len;
      },
      () => len,
    );
  }
}

/** Decode a U8 */
export const u8Decoder = new NumDecoder(ByteLen._1, (dv, i) => dv.getUint8(i));
/** Encode a U8 */
export const u8Encoder = new NumEncoder<number>(ByteLen._1, (dv, i, value) => dv.setUint8(i, value));
/** Decode a I8 */
export const i8Decoder = new NumDecoder(ByteLen._1, (dv, i) => dv.getInt8(i));
/** Encode a I8 */
export const i8Encoder = new NumEncoder<number>(ByteLen._1, (dv, i, value) => dv.setInt8(i, value));

/** Decode a U16 */
export const u16Decoder = new NumDecoder(ByteLen._2, (dv, i) => dv.getUint16(i, true));
/** Encode a U16 */
export const u16Encoder = new NumEncoder<number>(ByteLen._2, (dv, i, value) => dv.setUint16(i, value, true));
/** Decode a I16 */
export const i16Decoder = new NumDecoder(ByteLen._2, (dv, i) => dv.getInt16(i, true));
/** Encode a I16 */
export const i16Encoder = new NumEncoder<number>(ByteLen._2, (dv, i, value) => dv.setInt16(i, value, true));

/** Decode a U32 */
export const u32Decoder = new NumDecoder(ByteLen._4, (dv, i) => dv.getUint32(i, true));
/** Encode a U32 */
export const u32Encoder = new NumEncoder<number>(ByteLen._4, (dv, i, value) => dv.setUint32(i, value, true));
/** Decode a I32 */
export const i32Decoder = new NumDecoder(ByteLen._4, (dv, i) => dv.getInt32(i, true));
/** Encode a I32 */
export const i32Encoder = new NumEncoder<number>(ByteLen._4, (dv, i, value) => dv.setInt32(i, value, true));

/** Decode a U64 */
export const u64Decoder = new NumDecoder(ByteLen._8, (dv, i) => dv.getBigUint64(i, true));
/** Encode a U64 */
export const u64Encoder = new NumEncoder<bigint>(ByteLen._8, (dv, i, value) => dv.setBigUint64(i, value, true));
/** Decode a I64 */
export const i64Decoder = new NumDecoder(ByteLen._8, (dv, i) => dv.getBigInt64(i, true));
/** Encode a I64 */
export const i64Encoder = new NumEncoder<bigint>(ByteLen._8, (dv, i, value) => dv.setBigInt64(i, value, true));

const _128Encoder = new Encoder<bigint>(
  (state, value) => {
    if (value < 0) {
      value = BigInt.asUintN(ByteLen._16 * 8, value);
    }
    encodePositiveBigIntInto(value, state.u8a, state.i, 16);
    state.i += ByteLen._16;
  },
  () => ByteLen._16,
);
/** Encode a U128 */
export const u128Encoder = _128Encoder;
/** Encode a I128 */
export const i128Encoder = _128Encoder;

class _128Decoder extends Decoder<bigint> {
  constructor(signed: boolean) {
    super((state) => {
      let value = 0n;
      for (let i = 0, shift = 0n; i < ByteLen._16; i++, shift += 8n) {
        value += BigInt(state.u8a[state.i + i]!) << shift;
      }
      if (signed) {
        const isNegative = (state.u8a[state.i + ByteLen._16 - 1]! & 0b1000_0000) >> 7 === 1;
        if (isNegative) {
          value = BigInt.asIntN(ByteLen._16 * 8, value);
        }
      }
      state.i += ByteLen._16;
      return value;
    });
  }
}
/** Decode a U128 */
export const u128Decoder = new _128Decoder(false);
/** Decode a I128 */
export const i128Decoder = new _128Decoder(true);

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
