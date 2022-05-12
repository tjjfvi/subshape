import * as asserts from "std/testing/asserts.ts";
import * as $ from "../mod.ts";
import { fixtures } from "../test-util.ts";

Deno.test("Arrays", () => {
  fixtures.array_().forEach(([decoded, encoded, sizedEncoded]: [any[], Uint8Array, Uint8Array]) => {
    asserts.assertEquals($.array($.u8).decode(encoded), decoded);
    asserts.assertEquals($.array($.u8).encode(decoded), encoded);
    asserts.assertEquals($.sizedArray($.u8, decoded.length).decode(sizedEncoded), decoded);
    asserts.assertEquals($.sizedArray($.u8, decoded.length).encode(decoded), sizedEncoded);
  });
});
