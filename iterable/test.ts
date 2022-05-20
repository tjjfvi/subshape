import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

testCodec("set(u8)", $.set($.u8), [
  new Set(),
  new Set([0, 2, 4, 8]),
  new Set([2, 3, 5, 7]),
]);

testCodec("map(str, u8)", $.map($.str, $.u8), [
  new Map(),
  new Map([["0", 0], ["1", 1]]),
  new Map([["2^0", 0], ["2^1", 2], ["2^2", 4], ["2^3", 8], ["2^4", 16]]),
]);

const $iterableArray = $.iterable<number, number[]>({
  $el: $.u8,
  calcLength: (arr) => arr.length,
  rehydrate: (iter) => [...iter],
});
testCodec("iterableArray", $iterableArray, [
  [],
  [0, 2, 4, 8],
  [2, 3, 5, 7],
]);
