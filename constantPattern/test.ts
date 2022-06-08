import * as $ from "../mod.ts";
import { assertThrowsSnapshot, testCodec } from "../test-util.ts";

const magicNumber = 0x6174656d;
const $magicNumber = $.constantPattern(magicNumber, $.u32);
testCodec("constantPattern", $magicNumber, [magicNumber]);

Deno.test("constantPattern.encode throws", async (t) => {
  await assertThrowsSnapshot(t, () => $magicNumber.encode(123 as any));
});

Deno.test("constantPattern.decode throws", async (t) => {
  await assertThrowsSnapshot(t, () => $magicNumber.decode($.u32.encode(123)));
});
