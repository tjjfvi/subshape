import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

function generateIntTests(signed: boolean, size: number) {
  const s = BigInt(size);
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
    ];
}

testCodec($.u8, generateIntTests(false, 8).map(Number));
testCodec($.u16, generateIntTests(false, 16).map(Number));
testCodec($.u32, generateIntTests(false, 32).map(Number));
testCodec($.u64, generateIntTests(false, 64).map(BigInt));
testCodec($.u128, generateIntTests(false, 128).map(BigInt));
testCodec($.u256, generateIntTests(false, 256).map(BigInt));

testCodec($.i8, generateIntTests(true, 8).map(Number));
testCodec($.i16, generateIntTests(true, 16).map(Number));
testCodec($.i32, generateIntTests(true, 32).map(Number));
testCodec($.i64, generateIntTests(true, 64).map(BigInt));
testCodec($.i128, generateIntTests(true, 128).map(BigInt));
testCodec($.i128, generateIntTests(true, 128).map(BigInt));
testCodec($.i256, generateIntTests(true, 256).map(BigInt));
