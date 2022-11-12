/// <reference lib="deno.unstable"/>

import { assertEquals, assertThrows } from "https://deno.land/std@0.161.0/testing/asserts.ts"
import { assertSnapshot } from "https://deno.land/std@0.161.0/testing/snapshot.ts"
import { AnyCodec, assert, Codec, ScaleAssertError } from "./common/mod.ts"

const [lipsum, words, cargoLock] = ["lipsum.txt", "words.txt", "Cargo.lock"].map((fileName) =>
  () => Deno.readTextFile(fileName)
)
export const files = { lipsum: lipsum!, words: words!, cargoLock: cargoLock! }

export function testCodec<T>(
  codec: Codec<T>,
  values: NoInfer<T>[] | Record<string, NoInfer<T> | (() => NoInfer<T>)>,
  async?: boolean,
): void
export function testCodec<T>(
  codec: Codec<T>,
  values: T[] | Record<string, T | (() => T)>,
  async = false,
) {
  for (const key in values) {
    let value = values[key as never] as T | (() => T)
    const label = values instanceof Array
      ? Deno.inspect(value, {
        depth: Infinity,
        trailingComma: true,
        compact: true,
        iterableLimit: Infinity,
      })
      : key
    Deno.test(`${Deno.inspect(codec)} ${label}`, async (t) => {
      if (typeof value === "function") {
        value = (value as () => T)()
      }
      assert(codec, value)
      const encoded = async ? await codec.encodeAsync(value) : codec.encode(value)
      await assertSnapshot(t, encoded, { serializer: serializeU8A })
      const decoded = codec.decode(encoded)
      assertEquals(decoded, value)
      assert(codec, decoded)
    })
  }
}

export function testInvalid(codec: AnyCodec, values: unknown[] | Record<string, unknown | (() => unknown)>) {
  for (const key in values) {
    let value: unknown = values[key as never]
    const label = values instanceof Array
      ? Deno.inspect(value, {
        depth: Infinity,
        trailingComma: true,
        compact: true,
        iterableLimit: Infinity,
      })
      : key
    Deno.test(`${Deno.inspect(codec)} invalid ${label}`, async (t) => {
      if (typeof value === "function") {
        value = (value as () => unknown)()
      }
      await assertThrowsSnapshot(t, () => assert(codec as Codec<any>, value), ScaleAssertError)
    })
  }
}

function serializeU8A(array: Uint8Array) {
  return [...array].map((x) => x.toString(16).padStart(2, "0")).join("\n")
}

type NoInfer<T> = T extends infer U ? U : never
export function benchCodec<T>(name: string, codec: Codec<T>, value: NoInfer<T>): void
export function benchCodec<T>(name: string, codec: Codec<T>, value: T) {
  const encoded = codec.encode(value)
  Deno.bench(`- ${name} (${encoded.length}B) [encode] `, () => {
    codec.encode(value)
  })
  Deno.bench(`  ${name} (${encoded.length}B) [decode]`, () => {
    codec.decode(encoded)
  })
}

export async function assertThrowsSnapshot(
  t: Deno.TestContext,
  fn: () => unknown,
  ctor: abstract new(...args: any) => Error = Error,
) {
  try {
    fn()
  } catch (error) {
    if (!(error instanceof ctor)) {
      throw new Error("Expected " + ctor.name)
    }
    return await assertSnapshot(t, `${error.name}: ${error.message}`, { serializer: (x) => x })
  }
  throw new Error("Expected function to throw")
}

export { assertEquals, assertSnapshot, assertThrows }
