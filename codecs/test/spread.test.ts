import * as $ from "../../mod.ts"
import { testCodec, testInvalid } from "../../test-util.ts"

const $foo = $.taggedUnion("_tag", [
  ["a"],
  ["b", ["x", $.u8]],
])

const $bar = $.object(["bar", $.u8])

const $foobar = $.spread($foo, $bar)

testCodec($foobar, [
  { _tag: "a", bar: 123 },
  { _tag: "b", x: 0, bar: 123 },
])

testInvalid($foobar, [
  null,
  { _tag: null!, bar: 1 },
  { _tag: "", bar: 1 },
  { _tag: "b", bar: 1 },
  { _tag: "b", x: -1, bar: 1 },
  { _tag: "a", bar: -1 },
])
