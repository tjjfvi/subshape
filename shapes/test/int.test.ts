import * as $ from "../../mod.ts"
import { testInvalid, testShape } from "../../test-util.ts"

function generateIntTests(signed: boolean, size: number) {
  const s = BigInt(size)
  return signed
    ? [
      -1n * 2n ** (s - 1n), // min value
      -1n * 2n ** (s / 2n - 1n), // min value of last size
      -1n,
      0n,
      1n,
      2n ** (s / 2n - 1n) - 1n, // max value of last size
      2n ** (s - 1n) - 1n, // max value
    ]
    : [
      0n,
      1n,
      2n ** (s / 2n) - 1n, // max value of last size
      2n ** s - 1n, // max value
    ]
}

testShape($.u8, generateIntTests(false, 8).map(Number))
testShape($.u16, generateIntTests(false, 16).map(Number))
testShape($.u32, generateIntTests(false, 32).map(Number))
testShape($.u64, generateIntTests(false, 64).map(BigInt))
testShape($.u128, generateIntTests(false, 128).map(BigInt))
testShape($.u256, generateIntTests(false, 256).map(BigInt))

testShape($.i8, generateIntTests(true, 8).map(Number))
testShape($.i16, generateIntTests(true, 16).map(Number))
testShape($.i32, generateIntTests(true, 32).map(Number))
testShape($.i64, generateIntTests(true, 64).map(BigInt))
testShape($.i128, generateIntTests(true, 128).map(BigInt))
testShape($.i128, generateIntTests(true, 128).map(BigInt))
testShape($.i256, generateIntTests(true, 256).map(BigInt))

function generateIntInvalids(signed: boolean, size: number, fn: typeof Number | typeof BigInt) {
  const s = BigInt(size)
  return [
    null,
    undefined,
    {},
    "abc",
    NaN,
    1.2,
    fn === BigInt ? 0 : 0n,
    signed ? fn(-1n * 2n ** (s - 1n) - 1n) : fn(-1n),
    signed ? fn(2n ** (s - 1n)) : fn(2n ** s),
  ]
}

testInvalid($.u8, generateIntInvalids(false, 8, Number))
testInvalid($.u16, generateIntInvalids(false, 16, Number))
testInvalid($.u32, generateIntInvalids(false, 32, Number))
testInvalid($.u64, generateIntInvalids(false, 64, BigInt))
testInvalid($.u128, generateIntInvalids(false, 128, BigInt))
testInvalid($.u256, generateIntInvalids(false, 256, BigInt))

testInvalid($.i8, generateIntInvalids(true, 8, Number))
testInvalid($.i16, generateIntInvalids(true, 16, Number))
testInvalid($.i32, generateIntInvalids(true, 32, Number))
testInvalid($.i64, generateIntInvalids(true, 64, BigInt))
testInvalid($.i128, generateIntInvalids(true, 128, BigInt))
testInvalid($.i128, generateIntInvalids(true, 128, BigInt))
testInvalid($.i256, generateIntInvalids(true, 256, BigInt))
