import * as asserts from "std/testing/asserts.ts";
import * as $ from "../mod.ts";
import * as f from "../test-util.ts";

Deno.test("Number Compacts", () => {
  f.visitFixtures(f.fixtures.number_compact_, (bytes, decoded) => {
    asserts.assertEquals($.compact.decode(bytes), decoded);
    asserts.assertEquals($.compact.encode(decoded), bytes);
  }, f.constrainedIdentity<number>());
});

Deno.test("Bigint Compacts", () => {
  f.visitFixtures(f.fixtures.bigint_compact_, (bytes, decoded) => {
    asserts.assertEquals(BigInt($.compact.decode(bytes)), BigInt(decoded));
    asserts.assertEquals($.compact.encode(decoded), bytes);
  }, f.constrainedIdentity<bigint>());
});
