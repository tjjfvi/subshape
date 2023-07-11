import * as $ from "../../mod.ts"
import { testInvalid, testShape } from "../../test-util.ts"

type LinkedList = undefined | {
  val: number
  next: LinkedList
}

const $linkedList: $.Shape<LinkedList> = $.option($.object(
  $.field("val", $.u8),
  $.field("next", $.deferred(() => $linkedList)),
))

testShape($linkedList, [
  undefined,
  { val: 1, next: undefined },
  { val: 1, next: { val: 2, next: { val: 3, next: undefined } } },
])

testInvalid($linkedList, [
  null,
  { val: 1, next: null },
  { val: 1, next: { val: -1, next: undefined } },
  { val: 1, next: { val: 2, next: { val: 3, next: { val: -1, next: undefined } } } },
])
