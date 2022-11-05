import { Codec, createCodec, metadata } from "../common/mod.ts";

export function transform<T, U>(
  props: {
    $base: Codec<T>;
    encode: (value: U) => T;
    decode: (value: T) => U;
    assert?: (this: Codec<U>, value: unknown) => asserts value is U;
  },
): Codec<U> {
  return createCodec({
    _metadata: metadata("$.transform", transform, props),
    _staticSize: props.$base._staticSize,
    _encode(buffer, value) {
      props.$base._encode(buffer, props.encode(value));
    },
    _decode(buffer) {
      return props.decode(props.$base._decode(buffer));
    },
    _assert(value) {
      props.assert?.call(this, value);
      props.$base._assert(props.encode(value as U));
    },
  });
}
