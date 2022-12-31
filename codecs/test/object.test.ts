import * as $ from "../../mod.ts"
import { testCodec, testInvalid } from "../../test-util.ts"

const $person = $.withMetadata(
  $.metadata("$person"),
  $.object(
    $.field("name", $.str),
    $.field("nickName", $.str),
    $.optionalField("superPower", $.str),
    $.field("luckyNumber", $.u8),
  ),
)

testCodec($person, [
  {
    name: "Darrel",
    nickName: "The Durst",
    superPower: "telekinesis",
    luckyNumber: 9,
  },
  {
    name: "Michael",
    nickName: "Mike",
    luckyNumber: 7, // Cummon... be more predictable!
  },
])

testInvalid($person, [
  null,
  undefined,
  123,
  () => {},
  {},
  { name: "", nickName: "", superPower: 0, luckyNumber: 0 },
  { name: "", nickName: "", superPower: "", luckyNumber: -1 },
  { name: "", nickName: "", superPower: "", unluckyNumber: 0 },
])

const $foo = $.taggedUnion("_tag", [
  $.variant("a"),
  $.variant("b", $.field("x", $.u8)),
])

const $bar = $.field("bar", $.u8)

const $foobar = $.object($foo, $bar)

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
