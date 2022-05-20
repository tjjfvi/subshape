import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

testCodec("option(never)", $.option($.never), [undefined]);
