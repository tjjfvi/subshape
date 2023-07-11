import * as $ from "../../mod.ts"
import { testInvalid, testShape } from "../../test-util.ts"

testShape($.bool, [true, false])

testInvalid($.bool, [
  null,
  undefined,
  123,
  [],
  {},
])
