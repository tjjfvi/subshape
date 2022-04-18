import * as asserts from "std/testing/asserts.ts";
import * as s from "../mod.ts";

Deno.test("Dummy", () => {
  const c = s.dummy<typeof s.i8>(101);
  const encoded = c.encode(undefined as any);
  asserts.assertEquals(encoded, new Uint8Array([]));
  const decoded = c.decode(new Uint8Array([]));
  asserts.assertEquals(decoded, 101);
});
