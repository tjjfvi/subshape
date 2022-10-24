import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import * as $ from "./mod.ts";
import { assertThrowsSnapshot, testCodec } from "./test-util.ts";

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

type Graph = { label: string; to: Graph[] };

class GraphEncodeCtx {
  memo = new Map<Graph, number>();
}
class GraphDecodeCtx {
  memo: Graph[] = [];
}

const $compactU32 = $.compact($.u32);
const $graph: $.Codec<Graph> = $.createCodec({
  name: "$graph",
  _metadata: null,
  _staticSize: $compactU32._staticSize * 2 + $.str._staticSize,
  _encode(buffer, value) {
    const ctx = buffer.context.get(GraphEncodeCtx);
    const key = ctx.memo.get(value);
    if (key != null) {
      return $compactU32._encode(buffer, key);
    }
    $compactU32._encode(buffer, ctx.memo.size);
    ctx.memo.set(value, ctx.memo.size);
    $.str._encode(buffer, value.label);
    $.array($graph)._encode(buffer, value.to);
  },
  _decode(buffer) {
    const ctx = buffer.context.get(GraphDecodeCtx);
    const key = $compactU32._decode(buffer);
    if (key < ctx.memo.length) {
      return ctx.memo[key]!;
    }
    const graph: Graph = {
      label: $.str._decode(buffer),
      to: [],
    };
    ctx.memo.push(graph);
    graph.to = $.array($graph)._decode(buffer);
    return graph;
  },
});

const a: Graph = { label: "a", to: [] };
const b: Graph = { label: "b", to: [] };
const c: Graph = { label: "c", to: [] };
const d: Graph = { label: "d", to: [] };
const e: Graph = { label: "e", to: [] };
const f: Graph = { label: "f", to: [] };
a.to = [b, c];
b.to = [d];
d.to = [a];
c.to = [a, e];
e.to = [a, c, f];
f.to = [a, b, c, d, e, f];

testCodec($graph, { a, b, c, d, e, f });

Deno.test("inspect", () => {
  assertEquals(Deno.inspect($.array($.tuple($.u8, $.str))), "$.array($.tuple($.u8, $.str))");
});
