import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

const $foo = $.taggedUnion(
  "_tag",
  ["a"],
  ["b", ["x", $.u8]],
);

const $bar = $.object(["bar", $.u8]);

const $foobar = $.spread($foo, $bar);

testCodec("object", $foobar, [
  { _tag: "a", bar: 123 },
  { _tag: "b", x: 0, bar: 123 },
]);
