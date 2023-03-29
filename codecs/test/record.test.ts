import * as $ from "../../mod.ts"
import { testCodec, testInvalid } from "../../test-util.ts"

testCodec($.record($.str), [
  { a: "hi", b: "sup", c: "yo" },
  { the: "quick", brown: "fox", jumped: "over", theLazy: "hen" },
])

testCodec($.record($.record($.u8)), [{
  one: { two: 3 },
  four: { five: 6 },
  seven: { eight: 9 },
}])

testInvalid($.record($.str), [[true, false], [1, 2, 3, -1, 4]])
testInvalid($.record($.u8), [{ this: "should" }, { be: "invalid" }, { and: "this" }])
