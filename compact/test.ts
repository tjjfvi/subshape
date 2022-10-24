import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

testCodec($.compactU32, [0, 1, 6, 8, 14, 16, 30, 32].map((x) => (2 ** x) - 1));
testCodec($.compactU256, [0, 6, 14, 30, 40, 64, 128, 128, 256, 536].map((x) => (1n << BigInt(x)) - 1n));
