import {
  Codec,
  createCodec,
  metadata,
  ScaleAssertError,
  ScaleDecodeError,
  ScaleEncodeError,
  withMetadata,
} from "../common/mod.ts";
import { compact } from "./compact.ts";
import { u32 } from "./int.ts";
import { tuple } from "./tuple.ts";

const compactU32 = compact(u32);

export function iterable<T, I extends Iterable<T>>(
  props: {
    $el: Codec<T>;
    calcLength: (iterable: I) => number;
    rehydrate: (iterable: Iterable<T>) => I;
    assert: (this: Codec<I>, value: unknown) => asserts value is I;
  },
): Codec<I> {
  return createCodec({
    _metadata: metadata("$.iterable", iterable, props),
    _staticSize: compactU32._staticSize,
    _encode(buffer, value) {
      const length = props.calcLength(value);
      compactU32._encode(buffer, length);
      buffer.pushAlloc(length * props.$el._staticSize);
      let i = 0;
      for (const el of value) {
        props.$el._encode(buffer, el);
        i++;
      }
      if (i !== length) throw new ScaleEncodeError(this, value, "Incorrect length returned by calcLength");
      buffer.popAlloc();
    },
    _decode(buffer) {
      const length = compactU32._decode(buffer);
      let done = false;
      const value = props.rehydrate(function*() {
        for (let i = 0; i < length; i++) {
          yield props.$el._decode(buffer);
        }
        done = true;
      }());
      if (!done) throw new ScaleDecodeError(this, buffer, "Iterable passed to rehydrate must be immediately exhausted");
      return value;
    },
    _assert(value) {
      props.assert.call(this, value);
      const length = props.calcLength(value as I);
      let i = 0;
      for (const el of value as I) {
        props.$el._assert(el);
        i++;
      }
      if (i !== length) throw new ScaleAssertError(this, value, "Incorrect length returned by calcLength");
    },
  });
}

export function set<T>($el: Codec<T>): Codec<Set<T>> {
  return withMetadata(
    metadata("$.set", set, $el),
    iterable({
      $el,
      calcLength: (set) => set.size,
      rehydrate: (values) => new Set(values),
      assert(value) {
        if (!(value instanceof Set)) {
          throw new ScaleAssertError(this, value, "!(value instanceof Set)");
        }
      },
    }),
  );
}

export function map<K, V>($key: Codec<K>, $value: Codec<V>): Codec<Map<K, V>> {
  return withMetadata(
    metadata("$.map", map, $key, $value),
    iterable({
      $el: tuple($key, $value),
      calcLength: (map) => map.size,
      rehydrate: (values) => new Map(values),
      assert(value) {
        if (!(value instanceof Map)) {
          throw new ScaleAssertError(this, value, "!(value instanceof Map)");
        }
      },
    }),
  );
}
