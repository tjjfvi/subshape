import * as $ from "../../mod.ts";
import { testCodec } from "../../test-util.ts";

testCodec($.dummy(101), [101]);
