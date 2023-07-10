/// <reference lib="deno.unstable"/>

import { assertEquals, assertThrows } from "https://deno.land/std@0.161.0/testing/asserts.ts"
import { assertSnapshot } from "https://deno.land/std@0.161.0/testing/snapshot.ts"
import { AnyShape, assert, DecodeBuffer, Shape, ShapeAssertError } from "./common/mod.ts"

const [lipsum, words, cargoLock] = ["lipsum.txt", "words.txt", "Cargo.lock"].map((fileName) => () =>
  Deno.readTextFile(fileName)
)
export const files = { lipsum: lipsum!, words: words!, cargoLock: cargoLock! }

export function testShape<T>(
  shape: Shape<T>,
  values: NoInfer<T>[] | Record<string, NoInfer<T> | (() => NoInfer<T>)>,
  async?: boolean,
): void
export function testShape<T>(
  shape: Shape<T>,
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
    Deno.test(`${Deno.inspect(shape)} ${label}`, async (t) => {
      if (typeof value === "function") {
        value = (value as () => T)()
      }
      assert(shape, value)
      const encoded = async ? await shape.encodeAsync(value) : shape.encode(value)
      await assertSnapshot(t, encoded, { serializer: serializeU8A })
      const decodeBuffer = new DecodeBuffer(encoded)
      const decoded = shape._decode(decodeBuffer)
      assertEquals(decoded, value)
      assertEquals(decodeBuffer.index, encoded.length)
      assert(shape, decoded)
    })
  }
}

export function testInvalid(shape: AnyShape, values: unknown[] | Record<string, unknown | (() => unknown)>) {
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
    Deno.test(`${Deno.inspect(shape)} invalid ${label}`, async (t) => {
      if (typeof value === "function") {
        value = (value as () => unknown)()
      }
      await assertThrowsSnapshot(t, () => assert(shape as Shape<any>, value), ShapeAssertError)
    })
  }
}

function serializeU8A(array: Uint8Array) {
  return [...array].map((x) => x.toString(16).padStart(2, "0")).join("\n")
}

type NoInfer<T> = T extends infer U ? U : never
export function benchShape<T>(name: string, shape: Shape<T>, value: NoInfer<T>): void
export function benchShape<T>(name: string, shape: Shape<T>, value: T) {
  const encoded = shape.encode(value)
  Deno.bench(`- ${name} (${encoded.length}B) [encode] `, () => {
    shape.encode(value)
  })
  Deno.bench(`  ${name} (${encoded.length}B) [decode]`, () => {
    shape.decode(encoded)
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
