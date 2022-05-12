import { benchCodec } from "../test-util.ts";
import * as s from "./codec.ts";

benchCodec("compact (u8)", s.compact, 2 ** (8 - 2) - 1);
benchCodec("compact (u16)", s.compact, 2 ** (16 - 2) - 1);
benchCodec("compact (u32)", s.compact, 2 ** (32 - 2) - 1);
benchCodec("compact (b64)", s.compact, 2n ** 64n - 1n);
benchCodec("compact (b128)", s.compact, 2n ** 128n - 1n);
