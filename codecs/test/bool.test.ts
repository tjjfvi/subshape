import * as $ from "../../mod.ts"
import { testCodec, testInvalid } from "../../test-util.ts"

testCodec($.bool, [true, false])

testInvalid($.bool, [
  null,
  undefined,
  123,
  [],
  {},
])
