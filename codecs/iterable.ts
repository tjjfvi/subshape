import {
  AssertState,
  Codec,
  createCodec,
  metadata,
  ScaleAssertError,
  ScaleDecodeError,
  ScaleEncodeError,
  withMetadata,
} from "../common/mod.ts"
import { compact } from "./compact.ts"
import { u32 } from "./int.ts"
import { tuple } from "./tuple.ts"

const compactU32 = compact(u32)

export function iterable<TI, I extends Iterable<TI>, TO = TI, O = I>(
  props: {
    $el: Codec<TI, TO>
    calcLength: (iterable: I) => number
    rehydrate: (iterable: Iterable<TO>) => O
    assert: (this: Codec<I, O>, assert: AssertState) => void
  },
): Codec<I, O> {
  return createCodec({
    _metadata: metadata("$.iterable", iterable, props),
    _staticSize: compactU32._staticSize,
    _encode(buffer, value) {
      const length = props.calcLength(value)
      compactU32._encode(buffer, length)
      buffer.pushAlloc(length * props.$el._staticSize)
      let i = 0
      for (const el of value) {
        props.$el._encode(buffer, el)
        i++
      }
      if (i !== length) throw new ScaleEncodeError(this, value, "Incorrect length returned by calcLength")
      buffer.popAlloc()
    },
    _decode(buffer) {
      const length = compactU32._decode(buffer)
      let done = false
      const value = props.rehydrate(function*() {
        for (let i = 0; i < length; i++) {
          yield props.$el._decode(buffer)
        }
        done = true
      }())
      if (!done) throw new ScaleDecodeError(this, buffer, "Iterable passed to rehydrate must be immediately exhausted")
      return value
    },
    _assert(assert) {
      props.assert.call(this, assert)
      const length = props.calcLength(assert.value as I)
      let i = 0
      for (const el of assert.value as I) {
        props.$el._assert(new AssertState(el, `#iterator[${i}]`))
        i++
      }
      if (i !== length) {
        throw new ScaleAssertError(this, assert.value, `${assert.path}: Incorrect length returned by calcLength`)
      }
    },
  })
}

export function set<I, O>($el: Codec<I, O>): Codec<ReadonlySet<I>, Set<O>> {
  return withMetadata(
    metadata("$.set", set, $el),
    iterable({
      $el,
      calcLength: (set) => set.size,
      rehydrate: (values) => new Set(values),
      assert(assert) {
        assert.instanceof(this, Set)
      },
    }),
  )
}

export function map<KI, KO, VI, VO>(
  $key: Codec<KI, KO>,
  $value: Codec<VI, VO>,
): Codec<ReadonlyMap<KI, VI>, Map<KO, VO>> {
  return withMetadata<ReadonlyMap<KI, VI>, Map<KO, VO>>(
    metadata("$.map", map, $key, $value),
    iterable({
      $el: tuple($key, $value),
      calcLength: (map) => map.size,
      rehydrate: (values) => new Map(values),
      assert(assert) {
        assert.instanceof(this, Map)
      },
    }),
  )
}
