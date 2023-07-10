import { createShape, metadata, ScaleAssertError, ScaleDecodeError, ScaleEncodeError, Shape } from "../common/mod.ts"

export const never: Shape<never> = createShape({
  _metadata: metadata("$.never"),
  _staticSize: 0,
  _encode(value) {
    throw new ScaleEncodeError(this, value, "Cannot encode $.never")
  },
  _decode(buffer) {
    throw new ScaleDecodeError(this, buffer, "Cannot decode $.never")
  },
  _assert(assert) {
    throw new ScaleAssertError(this, assert.value, `${assert.path}: Cannot validate $.never`)
  },
})
