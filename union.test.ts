import * as asserts from "std/testing/asserts.ts";
import * as s from "./mod.ts";
import * as f from "./test-util.ts";

Deno.test("Unions", () => {
  const c = s.taggedUnion(
    ["A"],
    ["B", [["B", s.str]]],
    ["C", [["C", s.tuple(s.u32, s.u64)]]],
    ["D", [[
      "D",
      s.record(
        ["a", s.u32],
        ["b", s.u64],
      ),
    ]]],
  );
  f.visitFixtures(f.fixtures.tagged_union_, (bytes, decoded) => {
    asserts.assertEquals(c.decode(bytes), decoded);
    asserts.assertEquals(c.encode(decoded as any), bytes);
  }, (raw: string) => {
    // TODO: clean up this normalization
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") {
      return { _tag: parsed };
    }
    const tag = Object.keys(parsed)[0]!;
    const { [tag]: value } = parsed;
    return {
      _tag: tag,
      [tag]: tag === "C" ? [value[0], BigInt(value[1])] : tag === "D" ? { a: value.a, b: BigInt(value.b) } : value,
    };
  });
});

Deno.test("KeyUnion", () => {
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
