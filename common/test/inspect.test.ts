import * as $ from "../../mod.ts"
import { assertEquals } from "../../test-util.ts"

type LinkedList = undefined | {
  val: number
  next: LinkedList
}

const $linkedList: $.Shape<LinkedList> = $.option($.object(
  $.field("val", $.u8),
  $.field("next", $.deferred(() => $linkedList)),
))

Deno.test("inspect", () => {
  assertEquals(Deno.inspect($.array($.tuple($.u8, $.str))), "$.array($.tuple($.u8, $.str))")
  assertEquals(
    Deno.inspect($linkedList),
    `
$0 = $.option(
  $.object($.field("val", $.u8), $.field("next", $.deferred(() => $0)))
)
    `.trim(),
  )
  assertEquals(
    Deno.inspect($.array($linkedList)),
    `
$.array(
  $0 = $.option(
    $.object($.field("val", $.u8), $.field("next", $.deferred(() => $0)))
  )
)
    `.trim(),
  )
  type Foo = { bar: Bar; baz: Baz }
  type Bar = { foo: Foo; baz: Baz }
  type Baz = { foo: Foo; bar: Bar }
  const $foo: $.Shape<Foo> = $.object($.field("bar", $.deferred(() => $bar)), $.field("baz", $.deferred(() => $baz)))
  const $bar: $.Shape<Bar> = $.object($.field("foo", $.deferred(() => $foo)), $.field("baz", $.deferred(() => $baz)))
  const $baz: $.Shape<Baz> = $.object($.field("foo", $.deferred(() => $foo)), $.field("bar", $.deferred(() => $bar)))
  assertEquals(
    Deno.inspect($foo, { depth: Infinity }),
    `
$0 = $.object(
  $.field(
    "bar",
    $.deferred(() => $1 = $.object(
      $.field("foo", $.deferred(() => $0)),
      $.field(
        "baz",
        $.deferred(() => $.object(
          $.field("foo", $.deferred(() => $0)),
          $.field("bar", $.deferred(() => $1))
        ))
      )
    ))
  ),
  $.field(
    "baz",
    $.deferred(() => $2 = $.object(
      $.field("foo", $.deferred(() => $0)),
      $.field(
        "bar",
        $.deferred(() => $.object(
          $.field("foo", $.deferred(() => $0)),
          $.field("baz", $.deferred(() => $2))
        ))
      )
    ))
  )
)
    `.trim(),
  )
})
