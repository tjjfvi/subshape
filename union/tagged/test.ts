import * as $ from "../../mod.ts";
import { testCodec } from "../../test-util.ts";

const $abc = $.taggedUnion(
  "_tag",
  ["A"],
  ["B", ["B", $.str]],
  ["C", ["C", $.tuple($.u32, $.u64)]],
  ["D", ["a", $.u32], ["b", $.u64]],
);

testCodec("union", $abc, [
  { _tag: "A" },
  { _tag: "B", B: "HELLO" },
  { _tag: "C", C: [255, 101010101n] },
  { _tag: "D", a: 101, b: 999n },
]);
