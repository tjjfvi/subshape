import * as s from "/mod.ts";
import * as f from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Strings", () => {
  f.visitFixtures(f.fixtures.str_, (bytes, decoded) => {
    asserts.assertEquals(s.str.decode(bytes), decoded);
    asserts.assertEquals(s.str.encode(decoded), bytes);
  }, f.constrainedIdentity<string>());
});
