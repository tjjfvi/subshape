import { Codec, createCodec, metadata } from "../common/mod.ts"

export function deferred<I, O>(getCodec: () => Codec<I, O>): Codec<I, O> {
  let $codec: Codec<I, O>
  const codec = createCodec({
    _metadata: metadata("$.deferred", deferred, getCodec),
    _staticSize: 0,
    _encode(buffer, value) {
      $codec ??= getCodec()
      buffer.pushAlloc($codec._staticSize)
      $codec._encode(buffer, value)
      buffer.popAlloc()
    },
    _decode(buffer) {
      $codec ??= getCodec()
      return $codec._decode(buffer)
    },
    _assert(assert) {
      $codec ??= getCodec()
      $codec._assert(assert)
    },
  })
  codec["_inspect"] = (inspect) => {
    // Use ._inspect manually so that Deno doesn't detect the circularity
    return `$.deferred(() => ${getCodec()["_inspect"]!(inspect)})`
  }
  return codec
}
