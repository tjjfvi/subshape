import * as $ from "../../mod.ts"
import { benchShape } from "../../test-util.ts"

benchShape("None<bool>", $.option($.bool), undefined)
benchShape("None<u128>", $.option($.u128), undefined)

benchShape("Some<bool>", $.option($.bool), true)
benchShape("Some<u128>", $.option($.u128), 12345678901234567890n)
