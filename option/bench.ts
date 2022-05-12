import * as s from "../mod.ts";
import { benchCodec } from "../test-util.ts";

benchCodec("None<bool>", s.option(s.bool), undefined);
benchCodec("None<u128>", s.option(s.u128), undefined);

benchCodec("Some<bool>", s.option(s.bool), true);
benchCodec("Some<u128>", s.option(s.u128), 12345678901234567890n);
