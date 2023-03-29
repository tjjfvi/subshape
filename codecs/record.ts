import { Codec } from "../common/mod.ts"
import { array } from "./array.ts"
import { transform } from "./transform.ts"
import { tuple } from "./tuple.ts"

export function record<K extends keyof any, V>(key: Codec<K>, value: Codec<V>) {
  return transform<[K, V][], Record<K, V>>({
    $base: array(tuple(key, value)),
    encode: Object.entries as (value: Record<K, V>) => [K, V][],
    decode: Object.fromEntries,
  })
}
