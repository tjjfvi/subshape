import * as s from "/mod.ts";
import { fixtures, visitFixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Tuples", () => {
  visitFixtures<string>(fixtures.tuple_, (bytes, decoded, i) => {
    const t = new s.Tuple(
      ...{
        0: [s.str, s.u8, s.str, s.u32],
        1: [s.str, s.i16, new s.Option(s.u16)],
      }[i]!,
    );
    const parsed = JSON.parse(decoded);
    asserts.assertEquals(t.decode(bytes), parsed);
    asserts.assertEquals(t.encode(parsed), bytes);
  });
});
