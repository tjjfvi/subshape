import { Codec } from "../common.ts";
import { union } from "../union/codec.ts";

export function result<Ok, Err extends Error>(
  $ok: Codec<Ok>,
  $err: Codec<Err>,
) {
  return Object.assign(
    union((value) => value instanceof Error ? 1 : 0, [$ok, $err]),
    {
      _metadata: [result, $ok, $err],
    },
  );
}
