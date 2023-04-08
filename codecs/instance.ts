import { AssertState } from "../common/assert.ts"
import { Codec, createCodec, metadata } from "../common/mod.ts"

export function instance<A extends unknown[], O extends I, I = O>(
  ctor: new(...args: A) => O,
  $args: Codec<A>,
  toArgs: (value: I) => [...A],
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
      $args._assert(new AssertState(toArgs(assert.value as O), "#arguments", assert))
    },
  })
}
