import { createShape, metadata, Shape } from "../common/mod.ts"

export const optionBool: Shape<boolean | undefined> = createShape({
  metadata: metadata("$.optionBool"),
  staticSize: 1,
  subEncode(buffer, value) {
    buffer.array[buffer.index++] = value === undefined ? 0 : 1 + +!value
  },
  subDecode(buffer) {
    const byte = buffer.array[buffer.index++]!
    return byte === 0 ? undefined : !(byte - 1)
  },
  subAssert(assert) {
    if (assert.value === undefined) return
    assert.typeof(this, "boolean")
  },
})
