import * as s from "../mod.ts";
import { benchCodec } from "../test-util.ts";

// Useful for testing overhead of Codec
benchCodec("dummy", s.dummy(null), null);
