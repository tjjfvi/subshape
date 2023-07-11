import * as $ from "../../mod.ts"
import { testInvalid, testShape } from "../../test-util.ts"

testShape($.option($.never), [undefined])

testInvalid($.never, [null, 0])
testInvalid($.option($.never), [null, 0])
