import * as $ from "../../mod.ts"
import { files, testInvalid, testShape } from "../../test-util.ts"

testShape($.tuple($.str, $.u8, $.str, $.u32), [["HELLO!", 1, await files.lipsum(), 2 ** 32 - 1]])

testShape($.tuple($.str, $.i16, $.option($.u16)), [["GOODBYE!", 2, 101]])

testInvalid($.tuple($.str, $.u8), [
  null,
  undefined,
  123,
  [],
  ["", 1, 1],
  ["", -1],
  [null, 1],
])
