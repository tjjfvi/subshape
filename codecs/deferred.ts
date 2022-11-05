import { Codec, metadata } from "../common/mod.ts";

export function deferred<T>(getCodec: () => Codec<T>): Codec<T> {
  let $codec: Codec<T>;
  return {
    // @ts-ignore https://gist.github.com/tjjfvi/ea194c4fce76dacdd60a0943256332aa
    __proto__: Codec.prototype,
    _metadata: metadata("$.deferred", deferred, getCodec),
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
    _validate(value) {
      $codec ??= getCodec();
      $codec._validate(value);
    },
    encode(value, validate) {
      $codec ??= getCodec();
      return $codec.encode(value, validate);
    },
    encodeAsync(value, validate) {
      $codec ??= getCodec();
      return $codec.encodeAsync(value, validate);
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
