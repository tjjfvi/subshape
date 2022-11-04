import { Codec, createCodec, metadata } from "../common/mod.ts";

export function promise<T>($value: Codec<T>): Codec<Promise<T>> {
  return createCodec({
    _metadata: metadata("$.promise", promise, $value),
    _staticSize: $value._staticSize,
    _encode(buffer, value) {
      buffer.writeAsync($value._staticSize, async (buffer) => {
        $value._encode(buffer, await value);
      });
    },
    _decode(buffer) {
      return Promise.resolve($value._decode(buffer));
    },
  });
}
