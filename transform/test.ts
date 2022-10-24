import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

const $boxU8 = $.transform($.u8, ({ value }: { value: number }) => value, (value) => ({ value }));

testCodec($boxU8, [{ value: 0 }, { value: 1 }]);
