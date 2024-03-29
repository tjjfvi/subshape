import { createShape, metadata, Shape, ShapeDecodeError, ShapeVisitor, withMetadata } from "../common/mod.ts"
import { AnyShape } from "../mod.ts"
import { constant } from "./constant.ts"
import { u128, u16, u256, u32, u64, u8 } from "./int.ts"
import { field, object } from "./object.ts"
import { tuple } from "./tuple.ts"

const MAX_U6 = 0b00111111
const MAX_U14 = 0b00111111_11111111
const MAX_U30 = 0b00111111_11111111_11111111_11111111

export const compactVisitor = new ShapeVisitor<AnyShape>()

export function compact<I, O>(shape: Shape<I, O>): Shape<I, O> {
  return compactVisitor.visit(shape) as any
}

function compactNumber($base: Shape<number>): Shape<number> {
  return createShape({
    metadata: metadata("$.compact", compact, $base),
    staticSize: 5,
    subEncode(buffer, value) {
      if (value <= MAX_U6) {
        buffer.array[buffer.index++] = value << 2
      } else if (value <= MAX_U14) {
        u16.subEncode(buffer, (value << 2) | 0b01)
      } else if (value <= MAX_U30) {
        // Because JS bitwise ops use *signed* 32-bit ints, this operation
        // produces negative values when `value >= 2 ** 29`. However, this is ok,
        // as `setUint32` correctly casts these negative values back to unsigned
        // 32-bit ints.
        u32.subEncode(buffer, (value << 2) | 0b10)
      } else {
        buffer.array[buffer.index++] = 0b11
        u32.subEncode(buffer, value)
      }
    },
    subDecode(buffer) {
      switch (buffer.array[buffer.index]! & 0b11) {
        case 0:
          return buffer.array[buffer.index++]! >> 2
        case 1:
          return u16.subDecode(buffer) >> 2
        case 2:
          // We use an unsigned right shift, as the default shift operator
          // uses signed 32-bit ints, which would yield invalid values.
          return u32.subDecode(buffer) >>> 2
        default:
          if (buffer.array[buffer.index++]! !== 3) throw new ShapeDecodeError(this, buffer, "Out of range for U32")
          return u32.subDecode(buffer)
      }
    },
    subAssert(assert) {
      $base.subAssert(assert)
    },
  })
}

const compactU8 = compactNumber(u8)
const compactU16 = compactNumber(u16)
const compactU32 = compactNumber(u32)

compactVisitor.add(u8, () => compactU8)
compactVisitor.add(u16, () => compactU16)
compactVisitor.add(u32, () => compactU32)

function compactBigInt($base: Shape<bigint>): Shape<bigint> {
  return createShape({
    metadata: metadata("$.compact", compact, $base),
    staticSize: 5,
    subEncode(buffer, value) {
      if (value <= 0xff_ff_ff_ff) {
        compactU32.subEncode(buffer, Number(value))
        return
      }
      let extraBytes = 0
      let _value = value >> 32n
      while (_value > 0n) {
        _value >>= 8n
        extraBytes++
      }
      buffer.array[buffer.index++] = (extraBytes << 2) | 0b11
      u32.subEncode(buffer, Number(value & 0xff_ff_ff_ffn))
      _value = value >> 32n
      buffer.pushAlloc(extraBytes)
      for (let i = 0; i < extraBytes; i++) {
        buffer.array[buffer.index++] = Number(_value & 0xffn)
        _value >>= 8n
      }
      buffer.popAlloc()
    },
    subDecode(buffer) {
      const b = buffer.array[buffer.index]!
      if ((b & 0b11) < 3 || b === 3) {
        return BigInt(compactU32.subDecode(buffer))
      }
      const extraBytes = b >> 2
      buffer.index++
      let value = BigInt(u32.subDecode(buffer))
      for (let i = 0; i < extraBytes; i++) {
        value |= BigInt(buffer.array[buffer.index++]!) << BigInt(32 + i * 8)
      }
      return value
    },
    subAssert(assert) {
      $base.subAssert(assert)
    },
  })
}

const compactU64 = compactBigInt(u64)
const compactU128 = compactBigInt(u128)
const compactU256 = compactBigInt(u256)

compactVisitor.add(u64, () => compactU64)
compactVisitor.add(u128, () => compactU128)
compactVisitor.add(u256, () => compactU256)

compactVisitor.add(constant<any>, (shape) => shape)

compactVisitor.add(tuple<any[]>, (shape, ...entries) => {
  if (entries.length === 0) return shape
  if (entries.length > 1) throw new Error("Cannot derive compact shape for tuples with more than one field")
  return withMetadata(metadata("$.compact", compact<any, any>, shape), tuple(compact(entries[0]!)))
})

compactVisitor.add(field<any, any, any>, (shape, key, value) => {
  return withMetadata(metadata("$.compact", compact, shape), field(key, compact(value)))
})

compactVisitor.add(object<any[]>, (shape, ...entries) => {
  if (entries.length === 0) return shape
  if (entries.length > 1) throw new Error("Cannot derive compact shape for objects with more than one field")
  return withMetadata(metadata("$.compact", compact, shape), compact(entries[0]!))
})
