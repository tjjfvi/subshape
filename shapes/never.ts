import { createShape, metadata, Shape, ShapeAssertError, ShapeDecodeError, ShapeEncodeError } from "../common/mod.ts"

export const never: Shape<never> = createShape({
  _metadata: metadata("$.never"),
  _staticSize: 0,
  _encode(value) {
    throw new ShapeEncodeError(this, value, "Cannot encode $.never")
  },
  _decode(buffer) {
    throw new ShapeDecodeError(this, buffer, "Cannot decode $.never")
  },
  _assert(assert) {
    throw new ShapeAssertError(this, assert.value, `${assert.path}: Cannot validate $.never`)
  },
})
