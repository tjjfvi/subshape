import { AssertState } from "../common/assert.ts"
import { Codec, createCodec, metadata } from "../common/mod.ts"

export function instance<A extends unknown[], T>(
  ctor: new(...args: A) => T,
  $args: Codec<A>,
  toArgs: (value: T) => [...A],
): Codec<T> {
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
      $args._assert(new AssertState(toArgs(assert.value as T), "#arguments", assert))
    },
  })
}
