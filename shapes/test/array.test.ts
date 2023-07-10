import * as $ from "../../mod.ts"
import { testInvalid, testShape } from "../../test-util.ts"

testShape($.array($.u8), [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21],
])

testInvalid($.array($.u8), [
  null,
  undefined,
  123,
  ["abc"],
  [1, 2, 3, -1, 4],
])

testShape($.sizedArray($.u8, 1), [[1]])
testShape($.sizedArray($.u8, 2), [[1, 1]])
testShape($.sizedArray($.u8, 100), { "[1] * 100": Array(100).fill(1) as any })

testInvalid($.sizedArray($.u8, 3), [
  null,
  undefined,
  123,
  [],
  [1, 2, -1],
])

testShape($.uint8Array, [
  new Uint8Array([1, 2, 3, 4, 5]),
  new Uint8Array([6, 7, 8, 9, 10]),
  new Uint8Array([11, 12, 13, 14, 15]),
  new Uint8Array([16, 17, 18, 19, 20, 21]),
])

testInvalid($.uint8Array, [
  null,
  undefined,
  123,
  [],
  [1, 2, -1],
])

testShape($.sizedUint8Array(4), [
  new Uint8Array([0, 0, 0, 0]),
  new Uint8Array([1, 2, 3, 4]),
])

testInvalid($.sizedUint8Array(4), [
  null,
  undefined,
  [1, 2, 3, 4],
  new Uint8Array(),
  new Uint8Array(5),
])
