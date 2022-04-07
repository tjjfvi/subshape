import * as s from "/mod.ts";
import * as f from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Tuples", () => {
  f.visitFixtures(f.fixtures.tuple_, (bytes, decoded, i) => {
    const t = new s.Tuple(
      ...{
        0: [s.str, s.u8, s.str, s.u32],
        1: [s.str, s.i16, new s.Option(s.u16)],
      }[i]!,
    );
    asserts.assertEquals(t.decode(bytes), decoded);
    asserts.assertEquals(t.encode(decoded), bytes);
  }, (raw: string) => {
    return JSON.parse(raw);
  });
});
