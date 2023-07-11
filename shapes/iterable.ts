import {
  AssertState,
  createShape,
  metadata,
  Shape,
  ShapeAssertError,
  ShapeDecodeError,
  ShapeEncodeError,
} from "../common/mod.ts"
import { compact } from "./compact.ts"
import { u32 } from "./int.ts"

const compactU32 = compact(u32)

export function iterable<TI, I extends Iterable<TI>, TO = TI, O = I>(
  props: {
    $el: Shape<TI, TO>
    calcLength: (iterable: I) => number
    rehydrate: (iterable: Iterable<TO>) => O
    assert: (this: Shape<I, O>, assert: AssertState) => void
  },
): Shape<I, O> {
  return createShape({
    metadata: metadata("$.iterable", iterable, props),
    staticSize: compactU32.staticSize,
    subEncode(buffer, value) {
      const length = props.calcLength(value)
      compactU32.subEncode(buffer, length)
      buffer.pushAlloc(length * props.$el.staticSize)
      let i = 0
      for (const el of value) {
        props.$el.subEncode(buffer, el)
        i++
      }
      if (i !== length) throw new ShapeEncodeError(this, value, "Incorrect length returned by calcLength")
      buffer.popAlloc()
    },
    subDecode(buffer) {
      const length = compactU32.subDecode(buffer)
      let done = false
      const value = props.rehydrate(function*() {
        for (let i = 0; i < length; i++) {
          yield props.$el.subDecode(buffer)
        }
        done = true
      }())
      if (!done) throw new ShapeDecodeError(this, buffer, "Iterable passed to rehydrate must be immediately exhausted")
      return value
    },
    subAssert(assert) {
      props.assert.call(this, assert)
      const length = props.calcLength(assert.value as I)
      let i = 0
      for (const el of assert.value as I) {
        props.$el.subAssert(new AssertState(el, `#iterator[${i}]`))
        i++
      }
      if (i !== length) {
        throw new ShapeAssertError(this, assert.value, `${assert.path}: Incorrect length returned by calcLength`)
      }
    },
  })
}
