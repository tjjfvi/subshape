import { createShape, metadata, Shape, ShapeDecodeError } from "../common/mod.ts"

export function result<TI, TO, UI extends Error, UO extends Error>(
  $ok: Shape<TI, TO>,
  $err: Shape<UI, UO>,
): Shape<TI | UI, TO | UO> {
  if ($ok.metadata.some((x) => x.factory === result)) {
    throw new Error("Nested result shape will not roundtrip correctly")
  }
  return createShape({
    metadata: metadata("$.result", result, $ok, $err),
    staticSize: 1 + Math.max($ok.staticSize, $err.staticSize),
    subEncode(buffer, value) {
      if ((buffer.array[buffer.index++] = +(value instanceof Error))) {
        $err.subEncode(buffer, value as UI)
      } else {
        $ok.subEncode(buffer, value as TI)
      }
    },
    subDecode(buffer) {
      switch (buffer.array[buffer.index++]) {
        case 0: {
          const value = $ok.subDecode(buffer)
          if (value instanceof Error) {
            throw new ShapeDecodeError(
              this,
              buffer,
              "An ok value that is instanceof Error will not roundtrip correctly",
            )
          }
          return value
        }
        case 1: {
          return $err.subDecode(buffer)
        }
        default: {
          throw new ShapeDecodeError(this, buffer, "Result discriminant neither 0 nor 1")
        }
      }
    },
    subAssert(assert) {
      if (assert.value instanceof Error) {
        $err.subAssert(assert)
      } else {
        $ok.subAssert(assert)
      }
    },
  })
}
