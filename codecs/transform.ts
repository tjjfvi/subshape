import { AssertState, Codec, createCodec, metadata } from "../common/mod.ts";

export function transform<T, U>(
  props: {
    $base: Codec<T>;
    encode: (value: U) => T;
    decode: (value: T) => U;
    assert?: (this: Codec<U>, assert: AssertState) => void;
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
    _assert(assert) {
      props.assert?.call(this, assert);
      props.$base._assert(new AssertState(props.encode(assert.value as U), "#encode", assert));
    },
  });
}
