import * as s from "/mod.ts";
import * as f from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Booleans", () => {
  f.visitFixtures(f.fixtures.bool_, (bytes, decoded) => {
    asserts.assertEquals(s.bool.decode(bytes), decoded);
    asserts.assertEquals(s.bool.encode(decoded), bytes);
  }, f.constrainedIdentity<boolean>());
});
