import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

testCodec("u8[]", $.array($.u8), [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21],
]);

testCodec("[u8; 0]", $.sizedArray(0, $.u8), [[]]);
testCodec("[u8; 1]", $.sizedArray(1, $.u8), [[1]]);
testCodec("[u8; 2]", $.sizedArray(2, $.u8), [[1, 1]]);
testCodec("[u8; 100]", $.sizedArray(100, $.u8), [Array(100).fill(1) as any]);
