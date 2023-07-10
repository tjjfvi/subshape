import { AnyShape, createShape, Input, metadata, Output, Shape } from "../common/mod.ts"

export type InputTuple<T extends AnyShape[]> = {
  readonly [K in keyof T]: Input<T[K]>
}
export type OutputTuple<T extends AnyShape[]> = {
  [K in keyof T]: Output<T[K]>
}

export function tuple<T extends AnyShape[]>(...shapes: [...T]): Shape<InputTuple<T>, OutputTuple<T>> {
  return createShape({
    _metadata: metadata("$.tuple", tuple<T>, ...shapes),
    _staticSize: shapes.map((x) => x._staticSize).reduce((a, b) => a + b, 0),
    _encode(buffer, value) {
      for (let i = 0; i < shapes.length; i++) {
        shapes[i]._encode(buffer, value[i] as never)
      }
    },
    _decode(buffer) {
      const value = Array(shapes.length)
      for (let i = 0; i < shapes.length; i++) {
        value[i] = shapes[i]._decode(buffer)
      }
      return value as any
    },
    _assert(assert) {
      assert.instanceof(this, Array)
      assert.key(this, "length").equals(this, shapes.length)
      for (let i = 0; i < shapes.length; i++) {
        shapes[i]._assert(assert.key(this, i))
      }
    },
  })
}
