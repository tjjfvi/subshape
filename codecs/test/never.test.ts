import * as $ from "../../mod.ts"
import { testCodec, testInvalid } from "../../test-util.ts"

testCodec($.option($.never), [undefined])

testInvalid($.never, [null, 0])
testInvalid($.option($.never), [null, 0])
