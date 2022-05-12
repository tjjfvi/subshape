import * as asserts from "std/testing/asserts.ts";
import * as $ from "../mod.ts";
import * as f from "../test-util.ts";

Deno.test("Tuples", () => {
  f.visitFixtures(f.fixtures.tuple_, (bytes, decoded, i) => {
    const t = $.tuple(
      ...{
        0: [$.str, $.u8, $.str, $.u32],
        1: [$.str, $.i16, new $.Option($.u16)],
      }[i]!,
    );
    asserts.assertEquals(t.decode(bytes), decoded);
    asserts.assertEquals(t.encode(decoded), bytes);
  }, (raw: string) => {
    return JSON.parse(raw);
  });
});
