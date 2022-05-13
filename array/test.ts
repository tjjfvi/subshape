import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

testCodec("u8[]", $.array($.u8), [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21],
]);
