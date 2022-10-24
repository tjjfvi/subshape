import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

testCodec($.array($.u8), [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21],
]);

testCodec($.sizedArray($.u8, 1), [[1]]);
testCodec($.sizedArray($.u8, 2), [[1, 1]]);
testCodec($.sizedArray($.u8, 100), [Array(100).fill(1) as any]);

testCodec($.uint8Array, [
  new Uint8Array([1, 2, 3, 4, 5]),
  new Uint8Array([6, 7, 8, 9, 10]),
  new Uint8Array([11, 12, 13, 14, 15]),
  new Uint8Array([16, 17, 18, 19, 20, 21]),
]);

testCodec($.sizedUint8Array(4), [
  new Uint8Array([0, 0, 0, 0]),
  new Uint8Array([1, 2, 3, 4]),
]);
