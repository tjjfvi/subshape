import * as asserts from "std/testing/asserts.ts";
import * as s from "../../mod.ts";

Deno.test("Comparable Value Union", () => {
  enum X {
    A = "A",
    B = "B",
    C = "C",
  }
  const c = s.comparableValueUnion(s.str, X.A, X.B, X.C);

  const aBytes = c.encode(X.A);
  const aDecoded = c.decode(aBytes);
  asserts.assertEquals(aDecoded, X.A);

  const bBytes = c.encode(X.B);
  const bDecoded = c.decode(bBytes);
  asserts.assertEquals(bDecoded, X.B);

  const cBytes = c.encode(X.C);
  const cDecoded = c.decode(cBytes);
  asserts.assertEquals(cDecoded, X.C);
});
