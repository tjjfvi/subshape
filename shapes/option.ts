import { createShape, metadata, Shape, ShapeDecodeError } from "../common/mod.ts"

export function option<SI, SO>($some: Shape<SI, SO>): Shape<SI | undefined, SO | undefined>
export function option<SI, SO, N>($some: Shape<SI, SO>, none: N): Shape<SI | N, SO | N>
export function option<SI, SO, N>($some: Shape<SI, SO>, none?: N): Shape<SI | N, SO | N> {
  if ($some._metadata.some((x) => x.factory === option && x.args[1] === none)) {
    throw new Error("Nested option shape will not roundtrip correctly")
  }
  return createShape({
    _metadata: metadata("$.option", option<SI, SO, N>, $some, ...(none === undefined ? [] : [none!]) as [N]),
    _staticSize: 1 + $some._staticSize,
    _encode(buffer, value) {
      if ((buffer.array[buffer.index++] = +(value !== none))) {
        $some._encode(buffer, value as SI)
      }
    },
    _decode(buffer) {
      switch (buffer.array[buffer.index++]) {
        case 0:
          return none as N
        case 1: {
          const value = $some._decode(buffer)
          if (value === none) {
            throw new ShapeDecodeError(this, buffer, "Some(None) will not roundtrip correctly")
          }
          return value
        }
        default:
          throw new ShapeDecodeError(this, buffer, "Option discriminant neither 0 nor 1")
      }
    },
    _assert(assert) {
      if (assert.value === none) return
      $some._assert(assert)
    },
  })
}
