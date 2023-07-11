import { createShape, metadata, Shape } from "../common/mod.ts"

export const bool: Shape<boolean> = createShape({
  metadata: metadata("$.bool"),
  staticSize: 1,
  subEncode(buffer, value) {
    buffer.array[buffer.index++] = +value
  },
  subDecode(buffer) {
    return !!buffer.array[buffer.index++]!
  },
  subAssert(assert) {
    assert.typeof(this, "boolean")
  },
})
