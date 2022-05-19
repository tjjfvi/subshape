import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

testCodec("u8[]", $.array($.u8), [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21],
]);

testCodec("[u8; 1]", $.sizedArray($.u8, 1), [[1]]);
testCodec("[u8; 2]", $.sizedArray($.u8, 2), [[1, 1]]);
testCodec("[u8; 100]", $.sizedArray($.u8, 100), [Array(100).fill(1) as any]);

testCodec("uint8array", $.uint8array, [
  new Uint8Array([1, 2, 3, 4, 5]),
  new Uint8Array([6, 7, 8, 9, 10]),
  new Uint8Array([11, 12, 13, 14, 15]),
  new Uint8Array([16, 17, 18, 19, 20, 21]),
]);
