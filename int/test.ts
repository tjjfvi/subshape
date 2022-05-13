import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

testCodec("u8", $.u8, [0, 1, 2, 9]);
testCodec("u16", $.u16, [0, 1, 2, 9]);
testCodec("u32", $.u32, [0, 1, 2, 9]);
testCodec("u64", $.u64, [0n, 1n, 2n, 9n]);
testCodec("u128", $.u128, [0n, 1n, 2n, 9n]);

testCodec("i8", $.i8, [-9, -2, -1, 0, 1, 2, 9]);
testCodec("i16", $.i16, [-9, -2, -1, 0, 1, 2, 9]);
testCodec("i32", $.i32, [-9, -2, -1, 0, 1, 2, 9]);
testCodec("i64", $.i64, [-9n, -2n, -1n, 0n, 1n, 2n, 9n]);
testCodec("i128", $.i128, [-9n, -2n, -1n, 0n, 1n, 2n, 9n]);
