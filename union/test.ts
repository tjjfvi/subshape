import * as asserts from "std/testing/asserts.ts";
import * as $ from "../mod.ts";
import * as f from "../test-util.ts";

Deno.test("Unions", () => {
  const c = $.union(
    (value) => {
      return {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
      }[value._tag];
    },
    $.record(["_tag", $.dummy<$.Codec<"A">>("A")]),
    $.record(
      ["_tag", $.dummy<$.Codec<"B">>("B")],
      ["B", $.str],
    ),
    $.record(
      ["_tag", $.dummy<$.Codec<"C">>("C")],
      ["C", $.tuple($.u32, $.u64)],
    ),
    $.record(
      ["_tag", $.dummy<$.Codec<"D">>("D")],
      [
        "D",
        $.record(
          ["a", $.u32],
          ["b", $.u64],
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
