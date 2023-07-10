import { AssertState, createShape, metadata, Shape } from "../common/mod.ts"

export function transform<TI, UI, TO = TI, UO = UI>(
  props: {
    $base: Shape<TI, TO>
    encode: (value: UI) => TI
    decode: (value: TO) => UO
    assert?: (this: Shape<UI, UO>, assert: AssertState) => void
  },
): Shape<UI, UO> {
  return createShape({
    metadata: metadata("$.transform", transform, props),
    staticSize: props.$base.staticSize,
    subEncode(buffer, value) {
      props.$base.subEncode(buffer, props.encode(value))
    },
    subDecode(buffer) {
      return props.decode(props.$base.subDecode(buffer))
    },
    subAssert(assert) {
      props.assert?.call(this, assert)
      props.$base.subAssert(new AssertState(props.encode(assert.value as UI), "#encode", assert))
    },
  })
}
