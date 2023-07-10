import { createShape, metadata, Shape, ShapeDecodeError } from "../common/mod.ts"

export function result<TI, TO, UI extends Error, UO extends Error>(
  $ok: Shape<TI, TO>,
  $err: Shape<UI, UO>,
): Shape<TI | UI, TO | UO> {
  if ($ok._metadata.some((x) => x.factory === result)) {
    throw new Error("Nested result shape will not roundtrip correctly")
  }
  return createShape({
    _metadata: metadata("$.result", result, $ok, $err),
    _staticSize: 1 + Math.max($ok._staticSize, $err._staticSize),
    _encode(buffer, value) {
      if ((buffer.array[buffer.index++] = +(value instanceof Error))) {
        $err._encode(buffer, value as UI)
      } else {
        $ok._encode(buffer, value as TI)
      }
    },
    _decode(buffer) {
      switch (buffer.array[buffer.index++]) {
        case 0: {
          const value = $ok._decode(buffer)
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
          return $err._decode(buffer)
        }
        default: {
          throw new ShapeDecodeError(this, buffer, "Result discriminant neither 0 nor 1")
        }
      }
    },
    _assert(assert) {
      if (assert.value instanceof Error) {
        $err._assert(assert)
      } else {
        $ok._assert(assert)
      }
    },
  })
}
