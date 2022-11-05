import * as $ from "../../mod.ts";
import { testCodec, testInvalid } from "../../test-util.ts";

testCodec($.set($.u8), [
  new Set(),
  new Set([0, 2, 4, 8]),
  new Set([2, 3, 5, 7]),
]);

testInvalid($.set($.u8), [
  null,
  undefined,
  123,
  [123],
  new Set([null]),
  new Set([1, 2, 3, -1, 4]),
]);

testCodec($.map($.str, $.u8), [
  new Map(),
  new Map([["0", 0], ["1", 1]]),
  new Map([["2^0", 0], ["2^1", 2], ["2^2", 4], ["2^3", 8], ["2^4", 16]]),
]);

testInvalid($.map($.str, $.u8), [
  null,
  undefined,
  123,
  [123],
  [["a", 1]],
  new Map([["a", null]]),
  new Map([["a", 1], ["b", 2], ["c", -1], ["d", 0]]),
  new Map([["a", 1], ["b", 2], [null, 3], ["d", 0]]),
]);

const $iterableArray = $.withMetadata(
  $.metadata("$iterableArray"),
  $.iterable<number, number[]>({
    $el: $.u8,
    calcLength: (arr) => arr.length,
    rehydrate: (iter) => [...iter],
    assert() {},
  }),
);

testCodec($iterableArray, [
  [],
  [0, 2, 4, 8],
  [2, 3, 5, 7],
]);
