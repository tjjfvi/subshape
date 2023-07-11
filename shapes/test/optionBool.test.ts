import * as $ from "../../mod.ts"
import { testInvalid, testShape } from "../../test-util.ts"

testShape($.optionBool, [undefined, true, false])

testInvalid($.optionBool, [123])
