import { createCodec, metadata } from "../common/mod.ts"

export const f64 = createCodec<number>({
  _metadata: metadata("$.f64"),
  _staticSize: 8,
  _encode(buffer, value) {
    buffer.view.setFloat64(buffer.index, value, true)
    buffer.index += 8
  },
  _decode(buffer) {
    const value = buffer.view.getFloat64(buffer.index, true)
    buffer.index += 4
    return value
  },
  _assert(assert) {
    assert.typeof(this, "number")
  },
})
