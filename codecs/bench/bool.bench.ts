import * as $ from "../../mod.ts"
import { benchCodec } from "../../test-util.ts"

benchCodec("bool", $.bool, true)
