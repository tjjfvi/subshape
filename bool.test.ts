import * as s from "/mod.ts";
import { fixtures, visitFixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Booleans", () => {
  visitFixtures<boolean>(fixtures.bool_, (bytes, decoded) => {
    asserts.assertEquals(s.bool.decode(bytes), decoded);
    asserts.assertEquals(s.bool.encode(decoded), bytes);
  });
});
