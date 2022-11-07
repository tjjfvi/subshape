import * as $ from "../../mod.ts";
import { assertThrows, testCodec, testInvalid } from "../../test-util.ts";

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

testInvalid($.result($.str, $strError), [
  null,
  undefined,
  Object.assign(new Error("foo"), { stack: "Error: foo" }),
  new StrErr(null!),
]);

Deno.test("result roundtrip error", async () => {
  assertThrows(() => $.result($.result($.u8, $strError), $strError));
  assertThrows(() => $.result($.withMetadata($.metadata("$foo"), $.result($.u8, $strError)), $strError));
  assertThrows(() => {
    const $foo = $.result($.u8, $strError);
    $foo._metadata = [];
    $.result($foo, $strError)
      // Ok(Err(""))
      .decode(new Uint8Array([0, 1, 0]));
  });
});
