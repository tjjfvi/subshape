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

export const u128 = createCodec<bigint>({
  _staticSize: 16,
  _encode(buffer, value) {
    buffer.view.setBigInt64(buffer.index, value, true);
    buffer.view.setBigInt64(buffer.index + 8, value >> 64n, true);
    buffer.index += 16;
  },
  _decode(buffer) {
    const right = buffer.view.getBigUint64(buffer.index, true);
    const left = buffer.view.getBigUint64(buffer.index + 8, true);
    buffer.index += 16;
    return (left << 64n) | right;
  },
});

export const i128 = createCodec<bigint>({
  _staticSize: 16,
  _encode(buffer, value) {
    buffer.view.setBigInt64(buffer.index, value, true);
    buffer.view.setBigInt64(buffer.index + 8, value >> 64n, true);
    buffer.index += 16;
  },
  _decode(buffer) {
    const right = buffer.view.getBigUint64(buffer.index, true);
    const left = buffer.view.getBigInt64(buffer.index + 8, true);
    buffer.index += 16;
    return (left << 64n) | right;
  },
});
