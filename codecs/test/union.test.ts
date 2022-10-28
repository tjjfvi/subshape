import * as $ from "../../mod.ts";
import { testCodec } from "../../test-util.ts";

const $primitive = $.withMetadata(
  "$primitive",
  null,
  $.union(
    (value) => {
      return typeof value === "string"
        ? 0
        : typeof value === "bigint"
        ? 2
        : typeof value === "boolean"
        ? 3
        : value === undefined
        ? 4
        : 6;
    },
    {
      0: $.str,
      /* skip number */
      2: $.u64,
      3: $.bool,
      4: $.dummy(undefined),
      /* skip symbol */
      6: $.dummy(null),
    },
  ),
);

const $abc = $.withMetadata(
  "$abc",
  null,
  $.taggedUnion("_tag", [
    ["A"],
    ["B", ["B", $.str]],
    ["C", ["C", $.tuple($.u32, $.u64)]],
    ["D", ["a", $.u32], ["b", $.u64]],
  ]),
);

const interestingU8s = {
  0: "Min",
  1: "Unit",
  2: "EvenPrime",
  28: "LargestPerfect",
  129: "FirstUninteresting",
  225: "LargestSquare",
  255: "Max",
} as const;

const $interestingU8s = $.withMetadata("$.stringUnion(interestingU8s)", null, $.stringUnion(interestingU8s));

const names = [
  "Ross",
  "Alisa",
  "Stefan",
  "Raoul",
  "James",
  "David",
  "Pierre",
] as const;

const $names = $.withMetadata("$.stringUnion(names)", null, $.stringUnion(names));

testCodec($primitive, [
  "abc",
  1234567890n,
  true,
  undefined,
  null,
]);

testCodec($abc, [
  { _tag: "A" },
  { _tag: "B", B: "HELLO" },
  { _tag: "C", C: [255, 101010101n] },
  { _tag: "D", a: 101, b: 999n },
]);

testCodec($names, [...names]);

testCodec($interestingU8s, Object.values(interestingU8s));
