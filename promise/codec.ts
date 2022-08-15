import { Codec, createAsyncCodec } from "../common.ts";

export function promise<T>($value: Codec<T>): Codec<Promise<T>> {
  return createAsyncCodec({
    name: "promise",
    _metadata: [promise, $value],
    _staticSize: $value._staticSize,
    async _encodeAsync(buffer, value) {
      $value._encode(buffer, await value);
    },
    _decode(buffer) {
      return Promise.resolve($value._decode(buffer));
    },
  });
}
