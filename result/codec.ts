import { Codec, withMetadata } from "../common.ts";
import { union } from "../union/codec.ts";

export function result<Ok, Err extends Error>(
  $ok: Codec<Ok>,
  $err: Codec<Err>,
): Codec<Ok | Err> {
  return withMetadata(
    "$.result",
    [result, $ok, $err],
    union((value) => value instanceof Error ? 1 : 0, [$ok, $err]),
  );
}
