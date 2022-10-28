import * as $ from "../../mod.ts";
import { assertThrows, testCodec } from "../../test-util.ts";

class StrErr extends Error {
  constructor(readonly str: string) {
    super();
    this.stack = this.message = "StrErr: " + this.str;
  }
}

const $strError = $.instance(StrErr, ["str", $.str]);

testCodec($.result($.str, $strError), [
  "ok",
  new StrErr("err"),
]);

Deno.test("option roundtrip error", async () => {
  assertThrows(() => $.result($.result($.u8, $strError), $strError));
  assertThrows(
    () =>
      $.result($.withMetadata("", null, $.result($.u8, $strError)), $strError)
        // Ok(Err(""))
        .decode(new Uint8Array([0, 1, 0])),
  );
});
