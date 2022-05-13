import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

testCodec("compact", $.compact, [
  0,
  2 ** 8 - 1,
  2 ** 16 - 1,
  2 ** 32 - 1,
  2n ** 64n - 1n,
  2n ** 128n - 1n,
]);
