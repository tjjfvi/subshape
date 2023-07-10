import { AnyShape, createShape, Input, metadata, Output, Shape } from "../common/mod.ts"

export type InputTuple<T extends AnyShape[]> = {
  readonly [K in keyof T]: Input<T[K]>
}
export type OutputTuple<T extends AnyShape[]> = {
  [K in keyof T]: Output<T[K]>
}

export function tuple<T extends AnyShape[]>(...shapes: [...T]): Shape<InputTuple<T>, OutputTuple<T>> {
  return createShape({
    metadata: metadata("$.tuple", tuple<T>, ...shapes),
    staticSize: shapes.map((x) => x.staticSize).reduce((a, b) => a + b, 0),
    subEncode(buffer, value) {
      for (let i = 0; i < shapes.length; i++) {
        shapes[i].subEncode(buffer, value[i] as never)
      }
    },
    subDecode(buffer) {
      const value = Array(shapes.length)
      for (let i = 0; i < shapes.length; i++) {
        value[i] = shapes[i].subDecode(buffer)
      }
      return value as any
    },
    subAssert(assert) {
      assert.instanceof(this, Array)
      assert.key(this, "length").equals(this, shapes.length)
      for (let i = 0; i < shapes.length; i++) {
        shapes[i].subAssert(assert.key(this, i))
      }
    },
  })
}
