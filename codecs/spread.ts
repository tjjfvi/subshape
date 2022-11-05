import { Codec, createCodec, Expand, metadata } from "../common/mod.ts";

export function spread<A, B>($a: Codec<A>, $b: Codec<B>): Codec<Expand<A & B>> {
  return createCodec({
    _metadata: metadata("$.spread", spread, $a, $b),
    _staticSize: $a._staticSize + $b._staticSize,
    _encode(buffer, value) {
      $a._encode(buffer, value);
      $b._encode(buffer, value);
    },
    _decode(buffer) {
      return { ...$a._decode(buffer), ...$b._decode(buffer) } as Expand<A & B>;
    },
    _validate(value) {
      $a._validate(value);
      $b._validate(value);
    },
  });
}
