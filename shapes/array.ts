import { createShape, metadata, Shape } from "../common/mod.ts"
import { compact } from "./compact.ts"
import { u32 } from "./int.ts"

const compactU32 = compact(u32)

type ArrayOfLength<
  T,
  L extends number,
  A extends T[] = [],
> = number extends L ? T[]
  : L extends A["length"] ? A
  : ArrayOfLength<T, L, [...A, T]>

export function sizedArray<L extends number, I, O>($el: Shape<I, O>, length: L): Shape<
  Readonly<ArrayOfLength<I, L>>,
  ArrayOfLength<O, L>
> {
  return createShape({
    metadata: metadata("$.sizedArray", sizedArray, $el, length),
    staticSize: $el.staticSize * length,
    subEncode(buffer, value) {
      for (let i = 0; i < value.length; i++) {
        $el.subEncode(buffer, value[i]!)
      }
    },
    subDecode(buffer) {
      const value: O[] = Array(length)
      for (let i = 0; i < value.length; i++) {
        value[i] = $el.subDecode(buffer)
      }
      return value as ArrayOfLength<O, L>
    },
    subAssert(assert) {
      assert.instanceof(this, Array)
      assert.key(this, "length").equals(this, length)
      for (let i = 0; i < length; i++) {
        $el.subAssert(assert.key(this, i))
      }
    },
  })
}

export function array<I, O = I>($el: Shape<I, O>): Shape<readonly I[], O[]> {
  return createShape({
    metadata: metadata("$.array", array, $el),
    staticSize: compactU32.staticSize,
    subEncode(buffer, value) {
      compactU32.subEncode(buffer, value.length)
      if (value.length) {
        buffer.pushAlloc(value.length * $el.staticSize)
        for (let i = 0; i < value.length; i++) {
          $el.subEncode(buffer, value[i]!)
        }
        buffer.popAlloc()
      }
    },
    subDecode(buffer) {
      const length = compactU32.subDecode(buffer)
      const value: O[] = Array(length)
      for (let i = 0; i < value.length; i++) {
        value[i] = $el.subDecode(buffer)
      }
      return value
    },
    subAssert(assert) {
      assert.instanceof(this, Array)
      for (let i = 0; i < (assert.value as unknown[]).length; i++) {
        $el.subAssert(assert.key(this, i))
      }
    },
  })
}

export const uint8Array: Shape<Uint8Array> = createShape({
  metadata: metadata("$.uint8Array"),
  staticSize: compactU32.staticSize,
  subEncode(buffer, value) {
    compactU32.subEncode(buffer, value.length)
    buffer.insertArray(value) // the contents of this will eventually be cloned by buffer
  },
  subDecode(buffer) {
    const length = compactU32.subDecode(buffer)
    const value = buffer.array.subarray(buffer.index, buffer.index + length)
    buffer.index += length
    return value
  },
  subAssert(assert) {
    assert.instanceof(this, Uint8Array)
  },
})

export function sizedUint8Array(length: number): Shape<Uint8Array> {
  return createShape({
    metadata: metadata("$.sizedUint8Array", sizedUint8Array, length),
    // We could set `staticSize` to `length`, but in this case it will usually
    // more efficient to insert the array dynamically, rather than manually copy
    // the bytes.
    staticSize: 0,
    subEncode(buffer, value) {
      buffer.insertArray(value) // the contents of this will eventually be cloned by buffer
    },
    subDecode(buffer) {
      return buffer.array.subarray(buffer.index, buffer.index += length)
    },
    subAssert(assert) {
      assert.instanceof(this, Uint8Array)
      assert.key(this, "length").equals(this, length)
    },
  })
}
