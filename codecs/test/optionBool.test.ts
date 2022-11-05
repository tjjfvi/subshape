import * as $ from "../../mod.ts";
import { testCodec, testInvalid } from "../../test-util.ts";

testCodec($.optionBool, [undefined, true, false]);

testInvalid($.optionBool, [123]);
