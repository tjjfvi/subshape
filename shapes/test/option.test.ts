import * as $ from "../../mod.ts"
import { assertThrows, testInvalid, testShape } from "../../test-util.ts"

testShape($.option($.str), ["HELLO!"])
testShape($.option($.u8), [1])
testShape($.option($.u32), [2 ** 32 - 1])
testShape($.option($.bool), [true, false, undefined])
testShape($.option($.str, null), ["hi", "low", null])

testInvalid($.option($.bool), [123])

Deno.test("option roundtrip error", () => {
  assertThrows(() => $.option($.option($.u8)))
  assertThrows(() => $.option($.withMetadata($.metadata("$foo"), $.option($.u8))))
  assertThrows(() => {
    const $foo = $.option($.u8)
    $foo._metadata = []
    $.option($foo)
      // Some(None)
      .decode(new Uint8Array([1, 0]))
  })
})
