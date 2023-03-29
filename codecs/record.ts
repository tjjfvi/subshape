import { Codec } from "../common/mod.ts"
import { array } from "./array.ts"
import { str } from "./str.ts"
import { transform } from "./transform.ts"
import { tuple } from "./tuple.ts"

export function record<V>(value: Codec<V>) {
  return transform<[string, V][], Record<string, V>>({
    $base: array(tuple(str, value)),
    encode: Object.entries,
    decode: Object.fromEntries,
  })
}
