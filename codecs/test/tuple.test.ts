import * as $ from "../../mod.ts";
import { files, testCodec } from "../../test-util.ts";

testCodec($.tuple($.str, $.u8, $.str, $.u32), [["HELLO!", 1, await files.lipsum(), 2 ** 32 - 1]]);

testCodec($.tuple($.str, $.i16, $.option($.u16)), [["GOODBYE!", 2, 101]]);
