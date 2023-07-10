import { createShape, metadata, Shape } from "../common/mod.ts"

export function deferred<I, O>(getShape: () => Shape<I, O>): Shape<I, O> {
  let $shape: Shape<I, O>
  const shape = createShape({
    _metadata: metadata("$.deferred", deferred, getShape),
    _staticSize: 0,
    _encode(buffer, value) {
      $shape ??= getShape()
      buffer.pushAlloc($shape._staticSize)
      $shape._encode(buffer, value)
      buffer.popAlloc()
    },
    _decode(buffer) {
      $shape ??= getShape()
      return $shape._decode(buffer)
    },
    _assert(assert) {
      $shape ??= getShape()
      $shape._assert(assert)
    },
  })
  shape["_inspect"] = (inspect) => {
    // Use ._inspect manually so that Deno doesn't detect the circularity
    return `$.deferred(() => ${getShape()["_inspect"]!(inspect)})`
  }
  return shape
}
