import * as $ from "../../mod.ts";
import { testCodec } from "../../test-util.ts";

// Doesn't extend `Error` to avoid call-stack instability
class MyError {
  constructor(
    readonly code: number,
    readonly message: string,
    readonly payload: {
      a: string;
      b: number;
      c: boolean;
    },
  ) {}
}

const $myError = $.withMetadata(
  $.metadata("$myError"),
  $.instance(
    MyError,
    ["code", $.u8],
    ["message", $.str],
    [
      "payload",
      $.object(
        ["a", $.str],
        ["b", $.u8],
        ["c", $.bool],
      ),
    ],
  ),
);

testCodec($myError, [
  new MyError(
    1,
    "At war with my Arch system config",
    {
      a: "a",
      b: 2,
      c: true,
    },
  ),
]);

namespace _typeTests {
  // @ts-ignore: Prevent execution
  if (1 as 0) return;

  const $payload = $.object(
    ["a", $.str],
    ["b", $.u8],
    ["c", $.bool],
  );

  // ok
  $.instance(MyError, ["code", $.u8], ["message", $.str], ["payload", $payload]);

  // @ts-expect-error: Missing constructor parameters
  $.instance(MyError);

  // @ts-expect-error: Constructor parameter type mismatch
  $.instance(MyError, ["code", $.u8], ["message", $.str], ["name", $.str]);

  // @ts-expect-error: Missing field
  $.instance(MyError, ["code", $.u8], ["message", $.str], ["paidload", $payload]);

  // @ts-expect-error: Field type mismatch
  $.instance(MyError, ["code", $.u8], ["message", $.str], ["name", $payload]);
}
