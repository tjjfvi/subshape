import { createShape, metadata } from "../common/mod.ts"

export const f64 = createShape<number>({
  metadata: metadata("$.f64"),
  staticSize: 8,
  subEncode(buffer, value) {
    buffer.view.setFloat64(buffer.index, value, true)
    buffer.index += 8
  },
  subDecode(buffer) {
    const value = buffer.view.getFloat64(buffer.index, true)
    buffer.index += 8
    return value
  },
  subAssert(assert) {
    assert.typeof(this, "number")
  },
})
