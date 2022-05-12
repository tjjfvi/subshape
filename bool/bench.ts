import { benchCodec } from "../test-util.ts";
import * as $ from "./codec.ts";

benchCodec("bool", $.bool, true);
