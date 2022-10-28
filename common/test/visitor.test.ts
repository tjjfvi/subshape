import * as $ from "../../mod.ts";
import { assertEquals, assertThrowsSnapshot } from "../../test-util.ts";

Deno.test("CodecVisitor", async (t) => {
  const visitor = new $.CodecVisitor<string>();
  visitor
    .add($.u8, () => "$.u8")
    .add($.int, (_, signed, size) => `$.int(${signed}, ${size})`)
    .generic(<T>() => visitor.add($.array<T>, (_, $el) => `$.array(${visitor.visit($el)})`));

  assertEquals(visitor.visit($.array($.array($.u8))), "$.array($.array($.u8))");
  assertEquals(visitor.visit($.array($.u128)), "$.array($.int(false, 128))");
  await assertThrowsSnapshot(t, () => visitor.visit($.str));
});
