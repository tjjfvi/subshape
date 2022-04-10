import * as asserts from "std/testing/asserts.ts";
import * as s from "./mod.ts";
import * as f from "./test-util.ts";

Deno.test("Unions", () => {
  const c = s.taggedUnion(
    s.taggedUnionMember("A"),
    s.taggedUnionMember("B", s.field("B", s.str)),
    s.taggedUnionMember("C", s.field("C", s.tuple(s.u32, s.u64))),
    s.taggedUnionMember(
      "D",
      s.field(
        "D",
        s.record(
          s.field("a", s.u32),
          s.field("b", s.u64),
        ),
      ),
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
