import * as s from "/mod.ts";
import * as fixtures from "/target/fixtures/mod.js";
import { visitFixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Number Compacts", () => {
  visitFixtures<number>(fixtures.number_compact_, (bytes, decoded) => {
    asserts.assertEquals(s.compactDecoder.decode(bytes), decoded);
    asserts.assertEquals(s.compactEncoder.encode(decoded), bytes);
  });
});

Deno.test("Bigint Compacts", () => {
  visitFixtures<bigint>(fixtures.bigint_compact_, (bytes, decoded) => {
    asserts.assertEquals(BigInt(s.compactDecoder.decode(bytes)), BigInt(decoded));
    asserts.assertEquals(s.compactEncoder.encode(decoded), bytes);
  });
});
