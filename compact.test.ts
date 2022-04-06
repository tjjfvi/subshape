import * as s from "/mod.ts";
import { fixtures, visitFixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Number Compacts", () => {
  visitFixtures<number>(fixtures.number_compact_, (bytes, decoded) => {
    asserts.assertEquals(s.compact.decode(bytes), decoded);
    asserts.assertEquals(s.compact.encode(decoded), bytes);
  });
});

Deno.test("Bigint Compacts", () => {
  visitFixtures<bigint>(fixtures.bigint_compact_, (bytes, decoded) => {
    asserts.assertEquals(BigInt(s.compact.decode(bytes)), BigInt(decoded));
    asserts.assertEquals(s.compact.encode(decoded), bytes);
  });
});
