import { metadata, Shape, withMetadata } from "../common/mod.ts"
import { iterable } from "./iterable.ts"
import { encodeHexPrefixed } from "./mod.ts"
import { tuple } from "./tuple.ts"

export function map<KI, KO extends KI, VI, VO>(
  $key: Shape<KI, KO>,
  $value: Shape<VI, VO>,
): Shape<ReadonlyMap<KI, VI>, ScaleMap<KO, VO>> {
  return withMetadata<ReadonlyMap<KI, VI>, ScaleMap<KO, VO>>(
    metadata("$.map", map, $key, $value),
    iterable({
      $el: tuple($key, $value),
      calcLength: (map) => map.size,
      rehydrate: (values) => new ScaleMap($key, values),
      assert(assert) {
        assert.instanceof(this, ScaleMap)
      },
    }),
  )
}

export function set<I, O extends I>($value: Shape<I, O>): Shape<ReadonlySet<I>, ScaleSet<O>> {
  return withMetadata(
    metadata("$.set", set, $value),
    iterable({
      $el: $value,
      calcLength: (set) => set.size,
      rehydrate: (values) => new ScaleSet($value, values),
      assert(assert) {
        assert.instanceof(this, ScaleSet)
      },
    }),
  )
}

type Primitive = undefined | null | string | number | boolean | bigint | symbol

export class ScaleMap<K, V> implements Map<K, V> {
  #inner = new Map<Primitive, [K, V]>()
  #hexMemo = new WeakMap<K & object, string>()

  constructor(readonly $key: Shape<K>, entries?: Iterable<[K, V]>) {
    if (entries) {
      for (const [key, value] of entries) {
        this.set(key, value)
      }
    }
  }

  #transformKey(key: K): Primitive {
    return transformKey(this.$key, this.#hexMemo, key)
  }

  get size() {
    return this.#inner.size
  }

  get [Symbol.toStringTag]() {
    return "ScaleMap"
  }

  clear(): void {
    this.#inner.clear()
  }

  delete(key: K): boolean {
    return this.#inner.delete(this.#transformKey(key))
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    this.#inner.forEach(([key, value]) => callbackfn.call(thisArg, value, key, this))
  }

  get(key: K): V | undefined {
    return this.#inner.get(this.#transformKey(key))?.[1]
  }

  has(key: K): boolean {
    return this.#inner.has(this.#transformKey(key))
  }

  set(key: K, value: V): this {
    this.#inner.set(this.#transformKey(key), [key, value])
    return this
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.#inner.values()
  }

  entries(): IterableIterator<[K, V]> {
    return this.#inner.values()
  }

  *keys(): IterableIterator<K> {
    for (const { 0: key } of this) {
      yield key
    }
  }

  *values(): IterableIterator<V> {
    for (const { 1: value } of this) {
      yield value
    }
  }
}

export class ScaleSet<T> implements Set<T> {
  #inner = new Map<Primitive, T>()
  #hexMemo = new WeakMap<T & object, string>()

  constructor(readonly $value: Shape<T, unknown>, values?: Iterable<T>) {
    if (values) {
      for (const value of values) {
        this.add(value)
      }
    }
  }

  #transformValue(value: T): Primitive {
    return transformKey(this.$value, this.#hexMemo, value)
  }

  get size() {
    return this.#inner.size
  }

  get [Symbol.toStringTag]() {
    return "ScaleSet"
  }

  clear(): void {
    this.#inner.clear()
  }

  delete(value: T): boolean {
    return this.#inner.delete(this.#transformValue(value))
  }

  forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
    this.#inner.forEach((value) => callbackfn.call(thisArg, value, value, this))
  }

  has(key: T): boolean {
    return this.#inner.has(this.#transformValue(key))
  }

  add(value: T): this {
    this.#inner.set(this.#transformValue(value), value)
    return this
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.#inner.values()
  }

  *entries(): IterableIterator<[T, T]> {
    for (const value of this) {
      yield [value, value]
    }
  }

  keys(): IterableIterator<T> {
    return this.#inner.values()
  }

  values(): IterableIterator<T> {
    return this.#inner.values()
  }
}

function transformKey<K>($key: Shape<K, unknown>, hexMemo: WeakMap<K & object, string>, key: K): Primitive {
  if (typeof key === "string") {
    // This ensures that the hexes won't ever clash with regular string keys,
    // but leaves most string keys unchanged for performance
    return key.startsWith("0x") ? "0x" + key : key
  }
  if (typeof key !== "object" && typeof key !== "function" || !key) {
    return key as K & Primitive
  }
  const existingHex = hexMemo.get(key)
  if (existingHex) return existingHex
  const hex = encodeHexPrefixed($key.encode(key))
  hexMemo.set(key, hex)
  return hex
}
