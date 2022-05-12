import { benchCodec } from "../test-util.ts";
import * as s from "./codec.ts";

benchCodec("bool", s.bool, true);
