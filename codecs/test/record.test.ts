import * as $ from "../../mod.ts"
import { testCodec, testInvalid } from "../../test-util.ts"

testCodec($.record($.str, $.str), [
  { a: "hi", b: "sup", c: "yo" },
  { the: "quick", brown: "fox", jumped: "over", theLazy: "hen" },
])

testCodec($.record($.str, $.record($.str, $.u8)), [{
  one: { two: 3 },
  four: { five: 6 },
  seven: { eight: 9 },
}])

testInvalid($.record($.str, $.u8), [["abc"], [1, 2, 3, -1, 4]])
