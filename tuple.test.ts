import * as s from "/mod.ts";
import { fixtures, visitFixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Tuples", () => {
  visitFixtures<string>(fixtures.tuple_, (bytes, decoded, i) => {
    const parsed = JSON.parse(decoded);
    asserts.assertEquals(
      new s.TupleDecoder(
        ...{
          0: [s.strDecoder, s.u8Decoder, s.strDecoder, s.u32Decoder],
          1: [s.strDecoder, s.i16Decoder, new s.OptionDecoder(s.u16Decoder)],
        }[i]!,
      ).decode(bytes),
      parsed,
    );
    asserts.assertEquals(
      new s.TupleEncoder(
        ...{
          0: [s.strEncoder, s.u8Encoder, s.strEncoder, s.u32Encoder],
          1: [s.strEncoder, s.i16Encoder, new s.OptionEncoder(s.u16Encoder)],
        }[i]!,
      ).encode(parsed),
      bytes,
    );
  });
});
