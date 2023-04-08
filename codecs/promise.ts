import { Codec, createCodec, metadata } from "../common/mod.ts"

export function promise<I, O>($value: Codec<I, O>): Codec<Promise<I>, Promise<O>> {
  return createCodec({
    _metadata: metadata("$.promise", promise, $value),
    _staticSize: $value._staticSize,
    _encode(buffer, value) {
      buffer.writeAsync($value._staticSize, async (buffer) => {
        $value._encode(buffer, await value)
      })
    },
    _decode(buffer) {
      return Promise.resolve($value._decode(buffer))
    },
    _assert(assert) {
      assert.instanceof(this, Promise)
    },
  })
}
