import * as $ from "../../mod.ts"
import { testInvalid, testShape } from "../../test-util.ts"

testShape($.record($.str), [
  { a: "hi", b: "sup", c: "yo" },
  { the: "quick", brown: "fox", jumped: "over", theLazy: "hen" },
])

testShape($.record($.record($.u8)), [{
  one: { two: 3 },
  four: { five: 6 },
  seven: { eight: 9 },
}])

testInvalid($.record($.str), [[true, false], [1, 2, 3, -1, 4]])
testInvalid($.record($.u8), [{ this: "should" }, { be: "invalid" }, { and: "this" }])
