import * as asserts from "std/testing/asserts.ts";
import * as s from "../mod.ts";
import * as f from "../test-util.ts";

Deno.test("Unions", () => {
  const c = s.union(
    (value) => {
      return {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
      }[value._tag];
    },
    s.record(["_tag", s.dummy<s.Codec<"A">>("A")]),
    s.record(
      ["_tag", s.dummy<s.Codec<"B">>("B")],
      ["B", s.str],
    ),
    s.record(
      ["_tag", s.dummy<s.Codec<"C">>("C")],
      ["C", s.tuple(s.u32, s.u64)],
    ),
    s.record(
      ["_tag", s.dummy<s.Codec<"D">>("D")],
      [
        "D",
        s.record(
          ["a", s.u32],
          ["b", s.u64],
        ),
      ],
    ),
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
