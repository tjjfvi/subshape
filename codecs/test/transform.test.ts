import * as $ from "../../mod.ts";
import { testCodec, testInvalid } from "../../test-util.ts";

const $boxU8 = $.withMetadata(
  $.metadata("$boxU8"),
  $.transform({
    $base: $.u8,
    encode: ({ value }: { value: number }) => value,
    decode: (value) => ({ value }),
    assert() {},
  }),
);

testCodec($boxU8, [{ value: 0 }, { value: 1 }]);

testInvalid($boxU8, [{ value: -1 }]);
