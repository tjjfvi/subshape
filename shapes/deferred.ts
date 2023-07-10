import { createShape, metadata, Shape } from "../common/mod.ts"

export function deferred<I, O>(getShape: () => Shape<I, O>): Shape<I, O> {
  let $shape: Shape<I, O>
  const shape = createShape({
    metadata: metadata("$.deferred", deferred, getShape),
    staticSize: 0,
    subEncode(buffer, value) {
      $shape ??= getShape()
      buffer.pushAlloc($shape.staticSize)
      $shape.subEncode(buffer, value)
      buffer.popAlloc()
    },
    subDecode(buffer) {
      $shape ??= getShape()
      return $shape.subDecode(buffer)
    },
    subAssert(assert) {
      $shape ??= getShape()
      $shape.subAssert(assert)
    },
  })
  shape["_inspect"] = (inspect) => {
    // Use ._inspect manually so that Deno doesn't detect the circularity
    return `$.deferred(() => ${getShape()["_inspect"]!(inspect)})`
  }
  return shape
}
