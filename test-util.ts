/// <reference lib="deno.unstable"/>

import { assertEquals } from "std/testing/asserts.ts";
import { assertSnapshot } from "std/testing/snapshot.ts";
import { Codec } from "./common.ts";

const [lipsum, words, cargoLock] = ["lipsum.txt", "words.txt", "Cargo.lock"].map((fileName) =>
  () => Deno.readTextFile(fileName)
);
export const files = { lipsum: lipsum!, words: words!, cargoLock: cargoLock! };

export function testCodec<T>(name: string, codec: Codec<T>, values: NoInfer<T>[] | Record<string, NoInfer<T>>): void;
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
      await assertSnapshot(t, encoded, { serializer: serializeU8A });
      const decoded = codec.decode(encoded);
      assertEquals(decoded, value);
    });
  }
}

function serializeU8A(array: Uint8Array) {
  return [...array].map((x) => x.toString(16).padStart(2, "0")).join("\n");
}

type NoInfer<T> = T extends infer U ? U : never;
export function benchCodec<T>(name: string, codec: Codec<T>, value: NoInfer<T>): void;
export function benchCodec<T>(name: string, codec: Codec<T>, value: T) {
  const encoded = codec.encode(value);
  Deno.bench(`- ${name} (${encoded.length}B) [encode] `, () => {
    codec.encode(value);
  });
  Deno.bench(`  ${name} (${encoded.length}B) [decode]`, () => {
    codec.decode(encoded);
  });
}
