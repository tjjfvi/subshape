import * as asserts from "std/testing/asserts.ts";
import * as $ from "../mod.ts";

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

Deno.test("Instances", () => {
  const c = $.instance(
    MyError,
    ["code", $.u8],
    ["message", $.str],
    [
      "payload",
      $.record(
        ["a", $.str],
        ["b", $.u8],
        ["c", $.bool],
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

namespace _typeTests {
  // @ts-ignore: Prevent execution
  if (1 as 0) return;

  let sPayload = $.record(
    ["a", $.str],
    ["b", $.u8],
    ["c", $.bool],
  );

  // ok
  $.instance(MyError, ["code", $.u8], ["message", $.str], ["payload", sPayload]);

  // @ts-expect-error: Missing constructor parameters
  $.instance(MyError);

  // @ts-expect-error: Constructor parameter type mismatch
  $.instance(MyError, ["code", $.u8], ["message", $.str], ["name", $.str]);

  // @ts-expect-error: Missing field
  $.instance(MyError, ["code", $.u8], ["message", $.str], ["paidload", sPayload]);

  // @ts-expect-error: Field type mismatch
  $.instance(MyError, ["code", $.u8], ["message", $.str], ["name", sPayload]);
}
