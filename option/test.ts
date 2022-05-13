import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

testCodec("option(str)", $.option($.str), ["HELLO!"]);
testCodec("option(u8)", $.option($.u8), [1]);
testCodec("option(u32)", $.option($.u32), [2 ** 32 - 1]);
testCodec("option(bool)", $.option($.bool), [true, false, undefined]);
