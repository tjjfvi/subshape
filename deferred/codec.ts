import { Codec } from "../common.ts";

export function deferred<T>(getCodec: () => Codec<T>): Codec<T> {
  let $codec: Codec<T>;
  return {
    // @ts-ignore https://gist.github.com/tjjfvi/ea194c4fce76dacdd60a0943256332aa
    __proto__: Codec.prototype,
    name: "$.deferred",
    _metadata: [deferred, getCodec],
    _staticSize: 0,
    _encode(buffer, value) {
      $codec ??= getCodec();
      buffer.pushAlloc($codec._staticSize);
      $codec._encode(buffer, value);
      buffer.popAlloc();
    },
    _decode(buffer) {
      $codec ??= getCodec();
      return $codec._decode(buffer);
    },
    encode(value) {
      $codec ??= getCodec();
      return $codec.encode(value);
    },
    encodeAsync(value) {
      $codec ??= getCodec();
      return $codec.encodeAsync(value);
    },
    decode(buffer) {
      $codec ??= getCodec();
      return $codec.decode(buffer);
    },
    _inspect(inspect) {
      // Use ._inspect manually so that Deno doesn't detect the circularity
      return `$.deferred(() => ${getCodec()._inspect!(inspect)})`;
    },
  };
}
