import * as $ from "../mod.ts";
import { benchCodec } from "../test-util.ts";

// for comparison
benchCodec("u128", $.u128, 123n);

benchCodec("[]", $.tuple(), []);
benchCodec("[u128]", $.tuple($.u128), [123n]);
benchCodec("[u128, u128]", $.tuple($.u128, $.u128), [123n, 456n]);
benchCodec("[u128, u128, u128]", $.tuple($.u128, $.u128, $.u128), [123n, 456n, 789n]);
