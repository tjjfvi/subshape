import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

class StrErr extends Error {
  constructor(readonly str: string) {
    super();
    this.stack = this.message = "StrErr: " + this.str;
  }
}

testCodec("result", $.result($.str, $.instance(StrErr, ["str", $.str])), [
  "ok",
  new StrErr("err"),
]);
