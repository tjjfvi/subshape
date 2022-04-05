import * as s from "/mod.ts";
import { fixtures, visitFixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Options", () => {
  visitFixtures<string>(fixtures.option_, (bytes, decoded, i) => {
    const parsed = JSON.parse(decoded) || undefined;
    asserts.assertEquals(
      new s.OptionDecoder(
        {
          0: s.strDecoder,
          1: s.u8Decoder,
          2: s.strDecoder,
          3: s.u32Decoder,
          4: undefined,
        }[i]!,
      ).decode(bytes),
      parsed,
    );
    asserts.assertEquals(
      new s.OptionEncoder(
        {
          0: s.strEncoder,
          1: s.u8Encoder,
          2: s.strEncoder,
          3: s.u32Encoder,
          4: undefined,
        }[i]!,
      ).encode(parsed),
      bytes,
    );
  });
});
