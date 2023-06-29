import * as $ from "../../mod.ts"
import { testCodec } from "../../test-util.ts"

const $iterableArray = $.withMetadata(
  $.metadata("$iterableArray"),
  $.iterable<number, number[]>({
    $el: $.u8,
    calcLength: (arr) => arr.length,
    rehydrate: (iter) => [...iter],
    assert() {},
  }),
)

testCodec($iterableArray, [
  [],
  [0, 2, 4, 8],
  [2, 3, 5, 7],
])
