import * as asserts from "std/testing/asserts.ts";
import * as $ from "../mod.ts";

Deno.test("Dummy", () => {
  const c = $.dummy<number>(101);
  const encoded = c.encode(undefined as any);
  asserts.assertEquals(encoded, new Uint8Array([]));
  const decoded = c.decode(new Uint8Array([]));
  asserts.assertEquals(decoded, 101);
});
