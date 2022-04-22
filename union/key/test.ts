import * as asserts from "std/testing/asserts.ts";
import { keyLiteralUnion } from "../../mod.ts";

enum Name {
  Ross = "Ross",
  Alisa = "Alisa",
  Stefan = "Stefan",
  Raoul = "Raoul",
  James = "James",
  David = "David",
  Pierre = "Pierre",
}

const ordered = [
  Name.Ross,
  Name.Alisa,
  Name.Stefan,
  Name.Raoul,
  Name.James,
  Name.David,
  Name.Pierre,
];

Deno.test("Key Literal Unions", () => {
  const c = keyLiteralUnion(...ordered);
  ordered.forEach((name) => {
    const encoded = c.encode(name);
    const decoded = c.decode(encoded);
    asserts.assertEquals(name, decoded);
  });
});
