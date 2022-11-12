import * as $ from "../../mod.ts"
import { assertEquals } from "../../test-util.ts"

type LinkedList = undefined | {
  val: number
  next: LinkedList
}

const $linkedList: $.Codec<LinkedList> = $.option($.object(
  ["val", $.u8],
  ["next", $.deferred(() => $linkedList)],
))

Deno.test("inspect", () => {
  assertEquals(Deno.inspect($.array($.tuple($.u8, $.str))), "$.array($.tuple($.u8, $.str))")
  assertEquals(
    Deno.inspect($linkedList),
    `$0 = $.option($.object([ "val", $.u8 ], [ "next", $.deferred(() => $0) ]))`,
  )
  assertEquals(
    Deno.inspect($.array($linkedList)),
    `$.array($0 = $.option($.object([ "val", $.u8 ], [ "next", $.deferred(() => $0) ])))`,
  )
  type Foo = { bar: Bar; baz: Baz }
  type Bar = { foo: Foo; baz: Baz }
  type Baz = { foo: Foo; bar: Bar }
  const $foo: $.Codec<Foo> = $.object(["bar", $.deferred(() => $bar)], ["baz", $.deferred(() => $baz)])
  const $bar: $.Codec<Bar> = $.object(["foo", $.deferred(() => $foo)], ["baz", $.deferred(() => $baz)])
  const $baz: $.Codec<Baz> = $.object(["foo", $.deferred(() => $foo)], ["bar", $.deferred(() => $bar)])
  assertEquals(
    Deno.inspect($foo, { depth: Infinity }),
    `
$0 = $.object(
  [
    "bar",
    $.deferred(() => $1 = $.object(
      [ "foo", $.deferred(() => $0) ],
      [
        "baz",
        $.deferred(() => $.object([ "foo", $.deferred(() => $0) ], [ "bar", $.deferred(() => $1) ]))
      ]
    ))
  ],
  [
    "baz",
    $.deferred(() => $2 = $.object(
      [ "foo", $.deferred(() => $0) ],
      [
        "bar",
        $.deferred(() => $.object([ "foo", $.deferred(() => $0) ], [ "baz", $.deferred(() => $2) ]))
      ]
    ))
  ]
)
    `.trim(),
  )
})
