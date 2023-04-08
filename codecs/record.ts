import { Codec } from "../common/mod.ts"
import { array } from "./array.ts"
import { str } from "./str.ts"
import { transform } from "./transform.ts"
import { tuple } from "./tuple.ts"

export function record<I, O>($value: Codec<I, O>): Codec<Readonly<Record<string, I>>, Record<string, O>> {
  return transform({
    $base: array(tuple(str, $value)),
    encode: Object.entries,
    decode: Object.fromEntries,
  })
}
