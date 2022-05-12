import { benchCodec } from "../test-util.ts";
import * as $ from "./codec.ts";

benchCodec("compact (u8)", $.compact, 2 ** (8 - 2) - 1);
benchCodec("compact (u16)", $.compact, 2 ** (16 - 2) - 1);
benchCodec("compact (u32)", $.compact, 2 ** (32 - 2) - 1);
benchCodec("compact (b64)", $.compact, 2n ** 64n - 1n);
benchCodec("compact (b128)", $.compact, 2n ** 128n - 1n);
