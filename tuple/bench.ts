import * as s from "../mod.ts";
import { benchCodec } from "../test-util.ts";

// for comparison
benchCodec("u128", s.u128, 123n);

benchCodec("[]", s.tuple(), []);
benchCodec("[u128]", s.tuple(s.u128), [123n]);
benchCodec("[u128, u128]", s.tuple(s.u128, s.u128), [123n, 456n]);
benchCodec("[u128, u128, u128]", s.tuple(s.u128, s.u128, s.u128), [123n, 456n, 789n]);
