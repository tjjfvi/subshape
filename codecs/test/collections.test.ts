import { assertEquals } from "https://deno.land/std@0.161.0/testing/asserts.ts"
import * as $ from "../../mod.ts"
import { testCodec, testInvalid } from "../../test-util.ts"

testCodec($.set($.u8), [
  new $.ScaleSet($.u8),
  new $.ScaleSet($.u8, [0, 2, 4, 8]),
  new $.ScaleSet($.u8, [2, 3, 5, 7]),
])

testInvalid($.set($.u8), [
  null,
  undefined,
  123,
  [123],
  new Set([null]),
  new Set([1, 2, 3, -1, 4]),
  new $.ScaleSet($.i8, [1, 2, 3, -1, 4]),
])

testCodec($.map($.str, $.u8), [
  new $.ScaleMap($.str),
  new $.ScaleMap($.str, [["0", 0], ["1", 1]]),
  new $.ScaleMap($.str, [["2^0", 0], ["2^1", 2], ["2^2", 4], ["2^3", 8], ["2^4", 16]]),
])

testInvalid($.map($.str, $.u8), [
  null,
  undefined,
  123,
  [123],
  [["a", 1]],
  new Map([["a", null]]),
  new Map([["a", 1], ["b", 2], ["c", -1], ["d", 0]]),
  new Map([["a", 1], ["b", 2], [null, 3], ["d", 0]]),
])

Deno.test("ScaleSet<Uint8Array>", () => {
  const set = new $.ScaleSet($.uint8Array, [new Uint8Array([0])])
  assertEquals(set.has(new Uint8Array([0])), true)
  assertEquals(set.size, 1)
  assertEquals(set.has(new Uint8Array([1])), false)
  set.add(new Uint8Array([1]))
  assertEquals(set.has(new Uint8Array([1])), true)
  assertEquals(set.size, 2)
  set.add(new Uint8Array([0]))
  assertEquals(set.size, 2)
  assertEquals(set.has(new Uint8Array([0])), true)
  assertEquals(set.delete(new Uint8Array([0])), true)
  assertEquals(set.size, 1)
  assertEquals(set.has(new Uint8Array([0])), false)
  assertEquals(set.delete(new Uint8Array([0])), false)
  assertEquals(set.size, 1)
  assertEquals(set.has(new Uint8Array([0])), false)
  set.clear()
  assertEquals(set.size, 0)
  assertEquals(set.has(new Uint8Array([1])), false)
})
