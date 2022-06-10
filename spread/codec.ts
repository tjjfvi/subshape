import { Codec, createCodec } from "../common.ts";

export function spread<A, B>($a: Codec<A>, $b: Codec<B>): Codec<A & B> {
  return createCodec({
    _metadata: [spread, $a, $b],
    _staticSize: $a._staticSize + $b._staticSize,
    _encode(buffer, value) {
      $a._encode(buffer, value);
      $b._encode(buffer, value);
    },
    _decode(buffer) {
      return { ...$a._decode(buffer), ...$b._decode(buffer) };
    },
  });
}
