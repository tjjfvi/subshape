import { Codec, createCodec, metadata } from "../common/mod.ts";

export function transform<T, U>(
  props: {
    $base: Codec<T>;
    encode: (value: U) => T;
    decode: (value: T) => U;
    validate?: (this: Codec<U>, value: unknown) => asserts value is U;
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
    _validate(value) {
      props.validate?.call(this, value);
      props.$base._validate(props.encode(value as U));
    },
  });
}
