import { AssertState } from "../common/assert.ts"
import { createShape, metadata, Shape } from "../common/mod.ts"

export function instance<AI extends readonly unknown[], AO extends readonly unknown[], I, O>(
  ctor: new(...args: AO) => O,
  $args: Shape<AI, AO>,
  toArgs: (value: I) => [...AI],
): Shape<I, O> {
  return createShape({
    metadata: metadata("$.instance", instance, ctor, $args, toArgs),
    staticSize: $args.staticSize,
    subEncode(buffer, value) {
      $args.subEncode(buffer, toArgs(value))
    },
    subDecode(buffer) {
      return new ctor(...$args.subDecode(buffer))
    },
    subAssert(assert) {
      assert.instanceof(this, ctor)
      $args.subAssert(new AssertState(toArgs(assert.value as I), "#arguments", assert))
    },
  })
}
