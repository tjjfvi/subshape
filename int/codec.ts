import { Codec, createCodec } from "../common.ts";

export const u8 = createCodec<number>({
  _staticSize: 1,
  _encode(buffer, value) {
    buffer.array[buffer.index++] = value;
  },
  _decode(buffer) {
    return buffer.array[buffer.index++]!;
  },
});

type NumMethodKeys = { [K in keyof DataView]: K extends `get${infer N}` ? N : never }[keyof DataView];
type NumMethodVal<K extends NumMethodKeys> = ReturnType<DataView[`get${K}`]>;

function _int<K extends NumMethodKeys>(size: number, key: K): Codec<NumMethodVal<K>> {
  const getMethod = DataView.prototype["get" + key as never] as any;
  const setMethod = DataView.prototype["set" + key as never] as any;
  return createCodec({
    _staticSize: size,
    _encode(buffer, value) {
      setMethod.call(buffer.view, buffer.index, value, true);
      buffer.index += size;
    },
    _decode(buffer) {
      const value = getMethod.call(buffer.view, buffer.index, true);
      buffer.index += size;
      return value;
    },
  });
}

export const i8 = _int(1, "Int8");
export const u16 = _int(2, "Uint16");
export const i16 = _int(2, "Int16");
export const u32 = _int(4, "Uint32");
export const i32 = _int(4, "Int32");
export const u64 = _int(8, "BigUint64");
export const i64 = _int(8, "BigInt64");

const _128 = (signed: boolean) => {
  const getMethod = DataView.prototype[signed ? "getBigInt64" : "getBigUint64"];
  return createCodec<bigint>({
    _staticSize: 16,
    _encode(buffer, value) {
      buffer.view.setBigInt64(buffer.index, value, true);
      buffer.view.setBigInt64(buffer.index + 8, value >> 64n, true);
      buffer.index += 16;
    },
    _decode(buffer) {
      const b = buffer.view.getBigUint64(buffer.index, true);
      const a = getMethod.call(buffer.view, buffer.index + 8, true);
      buffer.index += 16;
      return (a << 64n) | b;
    },
  });
};

export const u128 = _128(false);
export const i128 = _128(true);

const _256 = (signed: boolean) => {
  const getMethod = DataView.prototype[signed ? "getBigInt64" : "getBigUint64"];
  return createCodec<bigint>({
    _staticSize: 32,
    _encode(buffer, value) {
      buffer.view.setBigInt64(buffer.index, value, true);
      buffer.view.setBigInt64(buffer.index + 8, value >> 64n, true);
      buffer.view.setBigInt64(buffer.index + 16, value >> 128n, true);
      buffer.view.setBigInt64(buffer.index + 24, value >> 192n, true);
      buffer.index += 32;
    },
    _decode(buffer) {
      const d = buffer.view.getBigUint64(buffer.index, true);
      const c = buffer.view.getBigUint64(buffer.index + 8, true);
      const b = buffer.view.getBigUint64(buffer.index + 16, true);
      const a = getMethod.call(buffer.view, buffer.index + 24, true);
      buffer.index += 32;
      return (a << 192n) | (b << 128n) | (c << 64n) | d;
    },
  });
};

export const u256 = _256(false);
export const i256 = _256(true);
