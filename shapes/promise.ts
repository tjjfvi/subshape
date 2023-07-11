import { createShape, metadata, Shape } from "../common/mod.ts"

export function promise<I, O>($value: Shape<I, O>): Shape<Promise<I>, Promise<O>> {
  return createShape({
    metadata: metadata("$.promise", promise, $value),
    staticSize: $value.staticSize,
    subEncode(buffer, value) {
      buffer.writeAsync($value.staticSize, async (buffer) => {
        $value.subEncode(buffer, await value)
      })
    },
    subDecode(buffer) {
      return Promise.resolve($value.subDecode(buffer))
    },
    subAssert(assert) {
      assert.instanceof(this, Promise)
    },
  })
}
