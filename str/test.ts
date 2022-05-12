import * as asserts from "std/testing/asserts.ts";
import * as $ from "../mod.ts";
import * as f from "../test-util.ts";

Deno.test("Strings", () => {
  f.visitFixtures(f.fixtures.str_, (bytes, decoded) => {
    asserts.assertEquals($.str.decode(bytes), decoded);
    asserts.assertEquals($.str.encode(decoded), bytes);
  }, f.constrainedIdentity<string>());
});
