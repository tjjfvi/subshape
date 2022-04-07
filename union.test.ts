import * as s from "/mod.ts";
import * as f from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Unions", () => {
  const c = new s.TaggedUnion(
    new s.TaggedUnionMember("A"),
    new s.TaggedUnionMember("B", new s.RecordField("B", s.str)),
    new s.TaggedUnionMember("C", new s.RecordField("C", new s.Tuple(s.u32, s.u64))),
    new s.TaggedUnionMember(
      "D",
      new s.RecordField(
        "D",
        new s.Record(
          new s.RecordField("a", s.u32),
          new s.RecordField("b", s.u64),
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
