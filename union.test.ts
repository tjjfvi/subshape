import * as s from "/mod.ts";
import { fixtures, visitFixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

// TODO: clean up this normalization
const normalize = (raw: string): Record<PropertyKey, any> => {
  const parsed = JSON.parse(raw);
  if (typeof parsed === "string") {
    return { [s.Tag]: parsed };
  }
  const tag = Object.keys(parsed)[0]!;
  const { [tag]: value } = parsed;
  return {
    [s.Tag]: tag,
    [tag]: tag === "C" ? [value[0], BigInt(value[1])] : tag === "D" ? { a: value.a, b: BigInt(value.b) } : value,
  };
};

Deno.test("Unions", () => {
  const c = new s.TaggedUnion(
    // TODO: DO NOT IGNORE
    // @ts-ignore
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

  visitFixtures<string>(fixtures.tagged_union_, (bytes, decoded) => {
    const normalized = normalize(decoded);
    asserts.assertEquals(c.decode(bytes), normalized);
    asserts.assertEquals(c.encode(normalized as any), bytes);
  });
});
