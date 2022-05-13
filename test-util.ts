/// <reference lib="deno.unstable"/>

import { dirname, join } from "std/path/win32.ts";
import { assertEquals } from "std/testing/asserts.ts";
import { assertSnapshot } from "std/testing/snapshot.ts";
import { Codec } from "./common.ts";

const file = (path: string) => () => fetch(join(dirname(import.meta.url), path)).then((x) => x.text());
export const files = {
  lipsum: file("lipsum.txt"),
  words: file("words.txt"),
  cargoLock: file("Cargo.lock"),
};

export function testCodec<T>(name: string, codec: Codec<T>, values: T[] | Record<string, T>) {
  for (const key in values) {
    const value = values[key as never] as T;
    const label = values instanceof Array
      ? Deno.inspect(value, {
        depth: Infinity,
        trailingComma: true,
        compact: true,
        iterableLimit: Infinity,
      })
      : key;
    Deno.test(`${name} ${label}`, async (t) => {
      const encoded = codec.encode(value);
      const decoded = codec.decode(encoded);
      assertEquals(decoded, value);
      await assertSnapshot(t, encoded, { serializer: serializeU8A });
    });
  }
}

function serializeU8A(array: Uint8Array) {
  return [...array].map((x) => x.toString(16).padStart(2, "0")).join("\n");
}

export function benchCodec<T>(name: string, codec: Codec<T>, value: T) {
  const encoded = codec.encode(value);
  Deno.bench(`- ${name} (${encoded.length}B) [encode] `, () => {
    codec.encode(value);
  });
  Deno.bench(`  ${name} (${encoded.length}B) [decode]`, () => {
    codec.decode(encoded);
  });
}
