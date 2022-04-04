import * as s from "/mod.ts";
import { str_ } from "/target/fixtures/mod.js";
import { visitFixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Strings", () => {
  visitFixtures<string>(str_, (bytes, decoded) => {
    asserts.assertEquals(s.strDecoder.decode(bytes), decoded);
    asserts.assertEquals(s.strEncoder.encode(decoded), bytes);
  });
});
