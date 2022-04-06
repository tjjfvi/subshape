import * as s from "/mod.ts";
import { fixtures, visitFixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Options", () => {
  visitFixtures<string>(fixtures.option_, (bytes, decoded, i) => {
    const o = new s.Option(
      {
        0: s.str,
        1: s.u8,
        2: s.str,
        3: s.u32,
        4: undefined,
      }[i]!,
    );
    const parsed = JSON.parse(decoded) || undefined;
    asserts.assertEquals(o.decode(bytes), parsed);
    asserts.assertEquals(o.encode(parsed), bytes);
  });
});
