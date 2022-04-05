import * as s from "/mod.ts";
import { fixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Arrays", () => {
  fixtures.array_().forEach(([decoded, encoded, sizedEncoded]: [any[], Uint8Array, Uint8Array]) => {
    asserts.assertEquals(new s.ArrayDecoder(s.u8Decoder).decode(encoded), decoded);
    asserts.assertEquals(new s.ArrayEncoder(s.u8Encoder).encode(decoded), encoded);
    asserts.assertEquals(new s.SizedArrayDecoder(s.u8Decoder, decoded.length).decode(sizedEncoded), decoded);
    asserts.assertEquals(new s.SizedArrayEncoder(s.u8Encoder, decoded.length).encode(decoded), sizedEncoded);
  });
});
