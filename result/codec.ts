import { Codec } from "../common.ts";
import { union } from "../union/codec.ts";

export function result<Ok, Err extends Error>(
  $ok: Codec<Ok>,
  $err: Codec<Err>,
) {
  return union(
    (value) => {
      return value instanceof Error ? 1 : 0;
    },
    $ok,
    $err,
  );
}
