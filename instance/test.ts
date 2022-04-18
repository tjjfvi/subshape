import * as asserts from "std/testing/asserts.ts";
import * as s from "../mod.ts";

Deno.test("Instances", () => {
  class MyError extends Error {
    constructor(
      readonly code: number,
      readonly message: string,
      readonly payload: {
        a: string;
        b: number;
        c: boolean;
      },
    ) {
      super();
    }
  }
  const c = s.instance(
    MyError,
    ["code", s.u8],
    ["message", s.str],
    [
      "payload",
      s.record(
        ["a", s.str],
        ["b", s.u8],
        ["c", s.bool],
      ),
    ],
  );
  const myErr = new MyError(
    1,
    "At war with my Arch system config",
    {
      a: "a",
      b: 2,
      c: true,
    },
  );
  const myErrEncoded = c.encode(myErr);
  const myErrDecoded = c.decode(myErrEncoded);
  asserts.assertEquals(myErr.code, myErrDecoded.code);
  asserts.assertEquals(myErr.message, myErrDecoded.message);
  asserts.assertEquals(myErr.payload, myErrDecoded.payload);
});
