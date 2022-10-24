import * as $ from "../../mod.ts";
import { testCodec } from "../../test-util.ts";

testCodec($.optionBool, [undefined, true, false]);
