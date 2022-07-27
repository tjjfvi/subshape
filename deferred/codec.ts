import { Codec } from "../common.ts";

export function deferred<T>(getCodec: () => Codec<T>): Codec<T> {
  let $codec: Codec<T>;
  return {
    name: "deferred",
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
    decode(buffer) {
      $codec ??= getCodec();
      return $codec.decode(buffer);
    },
  };
}
