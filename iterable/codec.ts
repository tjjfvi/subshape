import { Codec, createCodec, DecodeError, EncodeError, withMetadata } from "../common.ts";
import { compactU32 } from "../compact/codec.ts";
import { tuple } from "../mod.ts";

export function iterable<T, I extends Iterable<T>>(
  { $el, calcLength, rehydrate }: {
    $el: Codec<T>;
    calcLength: (iterable: I) => number;
    rehydrate: (iterable: Iterable<T>) => I;
  },
): Codec<I> {
  return createCodec({
    name: "$.iterable",
    _metadata: [iterable, { $el, calcLength, rehydrate }],
    _staticSize: compactU32._staticSize,
    _encode(buffer, value) {
      const length = calcLength(value);
      compactU32._encode(buffer, length);
      buffer.pushAlloc(length * $el._staticSize);
      let i = 0;
      for (const el of value) {
        $el._encode(buffer, el);
        i++;
      }
      if (i !== length) throw new EncodeError(this, value, "Incorrect length returned by calcLength");
      buffer.popAlloc();
    },
    _decode(buffer) {
      const length = compactU32._decode(buffer);
      let done = false;
      const value = rehydrate(function*() {
        for (let i = 0; i < length; i++) {
          yield $el._decode(buffer);
        }
        done = true;
      }());
      if (!done) throw new DecodeError(this, buffer, "Iterable passed to rehydrate must be immediately exhausted");
      return value;
    },
  });
}

export function set<T>($el: Codec<T>): Codec<Set<T>> {
  return withMetadata(
    "$.set",
    [set, $el],
    iterable({
      $el,
      calcLength: (set) => set.size,
      rehydrate: (values) => new Set(values),
    }),
  );
}

export function map<K, V>($key: Codec<K>, $value: Codec<V>): Codec<Map<K, V>> {
  return withMetadata(
    "$.map",
    [map, $key, $value],
    iterable({
      $el: tuple($key, $value),
      calcLength: (map) => map.size,
      rehydrate: (values) => new Map(values),
    }),
  );
}
