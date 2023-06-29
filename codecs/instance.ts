import { AssertState } from "../common/assert.ts"
import { Codec, createCodec, metadata } from "../common/mod.ts"

export function instance<AI extends readonly unknown[], AO extends readonly unknown[], I, O>(
  ctor: new(...args: AO) => O,
  $args: Codec<AI, AO>,
  toArgs: (value: I) => [...AI],
): Codec<I, O> {
  return createCodec({
    _metadata: metadata("$.instance", instance, ctor, $args, toArgs),
    _staticSize: $args._staticSize,
    _encode(buffer, value) {
      $args._encode(buffer, toArgs(value))
    },
    _decode(buffer) {
      return new ctor(...$args._decode(buffer))
    },
    _assert(assert) {
      assert.instanceof(this, ctor)
      $args._assert(new AssertState(toArgs(assert.value as I), "#arguments", assert))
    },
  })
}
