import * as $ from "../../mod.ts"
import { benchCodec } from "../../test-util.ts"

benchCodec("None<bool>", $.option($.bool), undefined)
benchCodec("None<u128>", $.option($.u128), undefined)

benchCodec("Some<bool>", $.option($.bool), true)
benchCodec("Some<u128>", $.option($.u128), 12345678901234567890n)
