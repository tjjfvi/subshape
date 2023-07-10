import * as $ from "../../mod.ts"
import { testInvalid, testShape } from "../../test-util.ts"

// Doesn't extend `Error` to avoid call-stack instability
class MyError {
  constructor(
    readonly code: number,
    readonly message: string,
    readonly payload: {
      a: string
      b: number
      c: boolean
    },
  ) {}
}

const $myError = $.withMetadata(
  $.metadata("$myError"),
  $.instance(
    MyError,
    $.tuple(
      $.u8,
      $.str,
      $.object(
        $.field("a", $.str),
        $.field("b", $.u8),
        $.field("c", $.bool),
      ),
    ),
    (myError: MyError) => [myError.code, myError.message, myError.payload],
  ),
)

testShape($myError, [
  new MyError(
    1,
    "At war with my Arch system config",
    {
      a: "a",
      b: 2,
      c: true,
    },
  ),
])

testInvalid($myError, [
  null,
  undefined,
  { code: 123, message: "foo", payload: { a: "abc", b: 2, c: true } },
  Object.assign(new Error("foo"), { stack: "Error: foo" }),
  new MyError(-1, "a", { a: "abc", b: 2, c: true }),
  new MyError(123, "a", { a: "abc", b: 2, c: "idk" } as any),
])
