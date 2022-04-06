import * as s from "/mod.ts";
import { fixtures, visitFixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Strings", () => {
  visitFixtures<string>(fixtures.str_, (bytes, decoded) => {
    asserts.assertEquals(s.str.decode(bytes), decoded);
    asserts.assertEquals(s.str.encode(decoded), bytes);
  });
});
