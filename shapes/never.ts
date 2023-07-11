import { createShape, metadata, Shape, ShapeAssertError, ShapeDecodeError, ShapeEncodeError } from "../common/mod.ts"

export const never: Shape<never> = createShape({
  metadata: metadata("$.never"),
  staticSize: 0,
  subEncode(value) {
    throw new ShapeEncodeError(this, value, "Cannot encode $.never")
  },
  subDecode(buffer) {
    throw new ShapeDecodeError(this, buffer, "Cannot decode $.never")
  },
  subAssert(assert) {
    throw new ShapeAssertError(this, assert.value, `${assert.path}: Cannot validate $.never`)
  },
})
