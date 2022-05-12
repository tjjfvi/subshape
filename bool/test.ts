import * as asserts from "std/testing/asserts.ts";
import * as $ from "../mod.ts";
import * as f from "../test-util.ts";

Deno.test("Booleans", () => {
  f.visitFixtures(f.fixtures.bool_, (bytes, decoded) => {
    asserts.assertEquals($.bool.decode(bytes), decoded);
    asserts.assertEquals($.bool.encode(decoded), bytes);
  }, f.constrainedIdentity<boolean>());
});
