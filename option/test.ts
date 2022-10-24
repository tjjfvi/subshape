import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

testCodec($.option($.str), ["HELLO!"]);
testCodec($.option($.u8), [1]);
testCodec($.option($.u32), [2 ** 32 - 1]);
testCodec($.option($.bool), [true, false, undefined]);
