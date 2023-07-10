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
    _metadata: metadata("$.transform", transform, props),
    _staticSize: props.$base._staticSize,
    _encode(buffer, value) {
      props.$base._encode(buffer, props.encode(value))
    },
    _decode(buffer) {
      return props.decode(props.$base._decode(buffer))
    },
    _assert(assert) {
      props.assert?.call(this, assert)
      props.$base._assert(new AssertState(props.encode(assert.value as UI), "#encode", assert))
    },
  })
}
