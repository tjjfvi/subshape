import * as asserts from "std/testing/asserts.ts";
import { enum_ } from "./mod.ts";

enum Name {
  Ross,
  Alisa,
  Stefan,
  Raoul,
  James,
  David,
  Pierre,
}

Deno.test("Enums", () => {
  const c = enum_(Name);
  [Name.Ross, Name.Alisa, Name.Stefan, Name.Raoul, Name.James, Name.David, Name.Pierre].forEach((name) => {
    const encoded = c.encode(name);
    const decoded = c.decode(encoded);
    asserts.assertEquals(name, decoded);
  });
});
