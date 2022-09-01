import { benchCodec } from "../test-util.ts";
import * as $ from "./codec.ts";

benchCodec("compactU32 (6)", $.compactU32, 2 ** 6 - 1);
benchCodec("compactU32 (14)", $.compactU32, 2 ** 14 - 1);
benchCodec("compactU32 (30)", $.compactU32, 2 ** 30 - 1);
benchCodec("compactU32 (32)", $.compactU32, 2 ** 32 - 1);

benchCodec("compactU256 (6)", $.compactU256, 2n ** 6n - 1n);
benchCodec("compactU256 (14)", $.compactU256, 2n ** 14n - 1n);
benchCodec("compactU256 (30)", $.compactU256, 2n ** 30n - 1n);
benchCodec("compactU256 (32)", $.compactU256, 2n ** 32n - 1n);
benchCodec("compactU256 (64)", $.compactU256, 2n ** 64n - 1n);
benchCodec("compactU256 (128)", $.compactU256, 2n ** 128n - 1n);
benchCodec("compactU256 (256)", $.compactU256, 2n ** 256n - 1n);
