import * as s from "/mod.ts";
import * as f from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Options", () => {
  f.visitFixtures(f.fixtures.option_, (bytes, decoded, i) => {
    const o = s.option(
      {
        0: s.str,
        1: s.u8,
        2: s.str,
        3: s.u32,
        4: undefined,
      }[i]!,
    );
    asserts.assertEquals(o.decode(bytes), decoded);
    asserts.assertEquals(o.encode(decoded), bytes);
  }, (raw: string) => {
    return JSON.parse(raw) || undefined;
  });
});
