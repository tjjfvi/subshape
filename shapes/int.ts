import { createShape, metadata, Shape } from "../common/mod.ts"

export const u8 = createShape<number>({
  _metadata: intMetadata(false, 8),
  _staticSize: 1,
  _encode(buffer, value) {
    buffer.array[buffer.index++] = value
  },
  _decode(buffer) {
    return buffer.array[buffer.index++]!
  },
  _assert(assert) {
    assert.integer(this, 0, 255)
  },
})

function _intNumber(signed: boolean, size: 8 | 16 | 32): Shape<number> {
  const byteSize = size / 8
  const key = `${(signed ? "Int" : "Uint")}${size}` as const
  const getMethod = DataView.prototype[`get${key}`]
  const setMethod = DataView.prototype[`set${key}`]
  const min = signed ? -(2 ** (size - 1)) : 0
  const max = (2 ** (size - +signed)) - 1
  return createShape({
    _metadata: intMetadata(signed, size),
    _staticSize: byteSize,
    _encode(buffer, value) {
      setMethod.call(buffer.view, buffer.index, value, true)
      buffer.index += byteSize
    },
    _decode(buffer) {
      const value = getMethod.call(buffer.view, buffer.index, true)
      buffer.index += byteSize
      return value
    },
    _assert(assert) {
      assert.typeof(this, "number")
      assert.integer(this, min, max)
    },
  })
}

export const i8 = _intNumber(true, 8)
export const u16 = _intNumber(false, 16)
export const i16 = _intNumber(true, 16)
export const u32 = _intNumber(false, 32)
export const i32 = _intNumber(true, 32)

function _intBigInt(signed: boolean, size: 64 | 128 | 256): Shape<bigint> {
  const byteSize = size / 8
  const chunks = size / 64
  const getMethod = DataView.prototype[signed ? "getBigInt64" : "getBigUint64"]
  const min = signed ? -(1n << BigInt(size - 1)) : 0n
  const max = (1n << BigInt(size - +signed)) - 1n
  return createShape({
    _metadata: intMetadata(signed, size),
    _staticSize: byteSize,
    _encode(buffer, value) {
      for (let i = 0; i < chunks; i++) {
        buffer.view.setBigInt64(buffer.index, value, true)
        value >>= 64n
        buffer.index += 8
      }
    },
    _decode(buffer) {
      let value = getMethod.call(buffer.view, buffer.index + (byteSize - 8), true)
      for (let i = chunks - 2; i >= 0; i--) {
        value <<= 64n
        value |= buffer.view.getBigUint64(buffer.index + (i * 8), true)
      }
      buffer.index += byteSize
      return value
    },
    _assert(assert) {
      assert.bigint(this, min, max)
    },
  })
}

export const u64 = _intBigInt(false, 64)
export const i64 = _intBigInt(true, 64)
export const u128 = _intBigInt(false, 128)
export const i128 = _intBigInt(true, 128)
export const u256 = _intBigInt(false, 256)
export const i256 = _intBigInt(true, 256)

const intLookup = { u8, i8, u16, i16, u32, i32, u64, i64, u128, i128, u256, i256 }

export function int(signed: boolean, size: 8 | 16 | 32): Shape<number>
export function int(signed: boolean, size: 64 | 128 | 256): Shape<bigint>
export function int(signed: boolean, size: 8 | 16 | 32 | 64 | 128 | 256): Shape<number> | Shape<bigint>
export function int(signed: boolean, size: 8 | 16 | 32 | 64 | 128 | 256): Shape<number | bigint>
export function int(signed: boolean, size: 8 | 16 | 32 | 64 | 128 | 256): Shape<any> {
  const key = `${signed ? "i" : "u"}${size}` as const
  return intLookup[key]
}

function intMetadata<T extends number | bigint>(signed: boolean, size: number) {
  return metadata<T, T>(
    metadata(`$.${signed ? "i" : "u"}${size}`),
    metadata("$.int", int as any, signed, size),
  )
}
