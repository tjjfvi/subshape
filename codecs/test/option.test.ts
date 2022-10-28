import * as $ from "../../mod.ts";
import { assertThrows, testCodec } from "../../test-util.ts";

testCodec($.option($.str), ["HELLO!"]);
testCodec($.option($.u8), [1]);
testCodec($.option($.u32), [2 ** 32 - 1]);
testCodec($.option($.bool), [true, false, undefined]);

Deno.test("option roundtrip error", () => {
  assertThrows(() => $.option($.option($.u8)));
  assertThrows(
    () =>
      $.option($.withMetadata("", null, $.option($.u8)))
        // Some(None)
        .decode(new Uint8Array([1, 0])),
  );
});
