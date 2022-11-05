import * as $ from "../../mod.ts";
import { assertThrows, testCodec, testInvalid } from "../../test-util.ts";

testCodec($.option($.str), ["HELLO!"]);
testCodec($.option($.u8), [1]);
testCodec($.option($.u32), [2 ** 32 - 1]);
testCodec($.option($.bool), [true, false, undefined]);

testInvalid($.option($.bool), [123]);

Deno.test("option roundtrip error", () => {
  assertThrows(() => $.option($.option($.u8)));
  assertThrows(() => $.option($.withMetadata($.metadata("$foo"), $.option($.u8))));
  assertThrows(() => {
    const $foo = $.option($.u8);
    $foo._metadata = [];
    $.option($foo)
      // Some(None)
      .decode(new Uint8Array([1, 0]));
  });
});
