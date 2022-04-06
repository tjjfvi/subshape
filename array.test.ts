import * as s from "/mod.ts";
import { fixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Arrays", () => {
  fixtures.array_().forEach(([decoded, encoded, sizedEncoded]: [any[], Uint8Array, Uint8Array]) => {
    asserts.assertEquals(new s.Array(s.u8).decode(encoded), decoded);
    asserts.assertEquals(new s.Array(s.u8).encode(decoded), encoded);
    asserts.assertEquals(new s.SizedArray(s.u8, decoded.length).decode(sizedEncoded), decoded);
    asserts.assertEquals(new s.SizedArray(s.u8, decoded.length).encode(decoded), sizedEncoded);
  });
});
