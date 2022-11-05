import { Codec, createCodec } from "../common/mod.ts";

export function promise<T>($value: Codec<T>): Codec<Promise<T>> {
  return createCodec({
    name: "$.promise",
    _metadata: [promise, $value],
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
