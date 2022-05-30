import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

type LinkedList = undefined | {
  val: number;
  next: LinkedList;
};

const $linkedList: $.Codec<LinkedList> = $.option($.object(
  ["val", $.u8],
  ["next", $.deferred(() => $linkedList)],
));

testCodec("linkedList", $linkedList, [
  undefined,
  { val: 1, next: undefined },
  { val: 1, next: { val: 2, next: { val: 3, next: undefined } } },
]);
