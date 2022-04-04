import * as s from "/mod.ts";
import { tagged_union_ } from "/target/fixtures/mod.js";
import { visitFixtures } from "/test-util.ts";
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
  const D0 = new s.UnionDecoder(
    new s.RecordDecoder(new s.RecordFieldDecoder(s.Tag, new s.LiteralDecoder("A"))),
    new s.RecordDecoder(
      new s.RecordFieldDecoder(s.Tag, new s.LiteralDecoder("B")),
      new s.RecordFieldDecoder("B", s.strDecoder),
    ),
    new s.RecordDecoder(
      new s.RecordFieldDecoder(s.Tag, new s.LiteralDecoder("C")),
      new s.RecordFieldDecoder("C", new s.TupleDecoder(s.u32Decoder, s.u64Decoder)),
    ),
    new s.RecordDecoder(
      new s.RecordFieldDecoder(s.Tag, new s.LiteralDecoder("D")),
      new s.RecordFieldDecoder(
        "D",
        new s.RecordDecoder(
          new s.RecordFieldDecoder("a", s.u32Decoder),
          new s.RecordFieldDecoder("b", s.u64Decoder),
        ),
      ),
    ),
  );

  const E0 = new s.UnionEncoder(
    (value) => {
      return ({
        A: 0,
        B: 1,
        C: 2,
        D: 3,
      })[value[s.Tag]];
    },
    new s.RecordEncoder(
      s.DummyEncoder<s.RecordFieldEncoder<s.Tag, s.LiteralEncoder<"A">>>(),
    ),
    new s.RecordEncoder(
      s.DummyEncoder<s.RecordFieldEncoder<s.Tag, s.LiteralEncoder<"B">>>(),
      new s.RecordFieldEncoder("B", s.strEncoder),
    ),
    new s.RecordEncoder(
      s.DummyEncoder<s.RecordFieldEncoder<s.Tag, s.LiteralEncoder<"C">>>(),
      new s.RecordFieldEncoder("C", new s.TupleEncoder(s.u32Encoder, s.u64Encoder)),
    ),
    new s.RecordEncoder(
      s.DummyEncoder<s.RecordFieldEncoder<s.Tag, s.LiteralEncoder<"D">>>(),
      new s.RecordFieldEncoder(
        "D",
        new s.RecordEncoder(
          new s.RecordFieldEncoder("a", s.u32Encoder),
          new s.RecordFieldEncoder("b", s.u64Encoder),
        ),
      ),
    ),
  );
  visitFixtures<string>(tagged_union_, (bytes, decoded) => {
    const normalized = normalize(decoded);
    asserts.assertEquals(D0.decode(bytes), normalized);
    asserts.assertEquals(E0.encode(normalized as any), bytes);
  });
});
