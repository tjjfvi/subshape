import * as $ from "../../mod.ts"
import { testCodec, testInvalid } from "../../test-util.ts"

testCodec($.partialRecord($.str, $.str), [
  { a: "hi", b: "sup", c: "yo" },
  { the: "quick", brown: "fox", jumped: "over", theLazy: "hen" },
])

testCodec($.partialRecord($.str, $.partialRecord($.str, $.u8)), [{
  one: { two: 3 },
  four: { five: 6 },
  seven: { eight: 9 },
}])

testCodec($.partialRecord($.literalUnion(["a", "b"]), $.u8), [{ a: 1, b: 2 }])

testInvalid($.partialRecord($.str, $.str), [[true, false], [1, 2, 3, -1, 4]])
testInvalid($.partialRecord($.str, $.u8), [{ this: "should" }, { be: "invalid" }, { and: "this" }])
testInvalid($.partialRecord($.literalUnion(["first", "second"]), $.u8), [
  { hello: 3 },
  { goodbye: 4 },
  { first: 5, goodbye: 6 },
])
