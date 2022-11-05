import * as $ from "../../mod.ts";
import { assertThrowsSnapshot, testCodec, testInvalid } from "../../test-util.ts";

const magicNumber = 0x6174656d;
const $magicNumber = $.constant(magicNumber, $.u32);
testCodec($magicNumber, [magicNumber]);

testInvalid($magicNumber, [123]);

Deno.test("constantPattern.decode throws", async (t) => {
  await assertThrowsSnapshot(t, () => $magicNumber.decode($.u32.encode(123)));
});
