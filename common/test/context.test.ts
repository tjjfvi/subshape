import * as $ from "../../mod.ts"
import { assertEquals, assertThrowsSnapshot, testShape } from "../../test-util.ts"

Deno.test("ShapeVisitor", async (t) => {
  const visitor = new $.ShapeVisitor<string>()
  visitor
    .add($.u8, () => "$.u8")
    .add($.int, (_, signed, size) => `$.int(${signed}, ${size})`)
    .generic(<T>() => visitor.add($.array<T>, (_, $el) => `$.array(${visitor.visit($el)})`))

  assertEquals(visitor.visit($.array($.array($.u8))), "$.array($.array($.u8))")
  assertEquals(visitor.visit($.array($.u128)), "$.array($.int(false, 128))")
  await assertThrowsSnapshot(t, () => visitor.visit($.str))
})

type Graph = { label: string; to: Graph[] }

class GraphEncodeCtx {
  memo = new Map<Graph, number>()
}
class GraphDecodeCtx {
  memo: Graph[] = []
}

const $compactU32 = $.compact($.u32)
const $graph: $.Shape<Graph> = $.createShape({
  metadata: $.metadata("$graph"),
  staticSize: $compactU32.staticSize * 2 + $.str.staticSize,
  subEncode(buffer, value) {
    const ctx = buffer.context.get(GraphEncodeCtx)
    const key = ctx.memo.get(value)
    if (key != null) {
      return $compactU32.subEncode(buffer, key)
    }
    $compactU32.subEncode(buffer, ctx.memo.size)
    ctx.memo.set(value, ctx.memo.size)
    $.str.subEncode(buffer, value.label)
    $.array($graph).subEncode(buffer, value.to)
  },
  subDecode(buffer) {
    const ctx = buffer.context.get(GraphDecodeCtx)
    const key = $compactU32.subDecode(buffer)
    if (key < ctx.memo.length) {
      return ctx.memo[key]!
    }
    const graph: Graph = {
      label: $.str.subDecode(buffer),
      to: [],
    }
    ctx.memo.push(graph)
    graph.to = $.array($graph).subDecode(buffer)
    return graph
  },
  subAssert() {},
})

const a: Graph = { label: "a", to: [] }
const b: Graph = { label: "b", to: [] }
const c: Graph = { label: "c", to: [] }
const d: Graph = { label: "d", to: [] }
const e: Graph = { label: "e", to: [] }
const f: Graph = { label: "f", to: [] }
a.to = [b, c]
b.to = [d]
d.to = [a]
c.to = [a, e]
e.to = [a, c, f]
f.to = [a, b, c, d, e, f]

testShape($graph, { a, b, c, d, e, f })
