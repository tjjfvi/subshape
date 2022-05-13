import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

const $abc = $.union(
  (value) => {
    return {
      A: 0,
      B: 1,
      C: 2,
      D: 3,
    }[value._tag];
  },
  $.record(["_tag", $.dummy<$.Codec<"A">>("A")]),
  $.record(
    ["_tag", $.dummy<$.Codec<"B">>("B")],
    ["B", $.str],
  ),
  $.record(
    ["_tag", $.dummy<$.Codec<"C">>("C")],
    ["C", $.tuple($.u32, $.u64)],
  ),
  $.record(
    ["_tag", $.dummy<$.Codec<"D">>("D")],
    ["a", $.u32],
    ["b", $.u64],
  ),
);

testCodec("union", $abc, [
  { _tag: "A" },
  { _tag: "B", B: "HELLO" },
  { _tag: "C", C: [255, 101010101n] },
  { _tag: "D", a: 101, b: 999n },
]);
