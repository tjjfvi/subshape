import * as $ from "../../mod.ts"
import { benchShape } from "../../test-util.ts"

// for comparison
benchShape("u128", $.u128, 123n)

benchShape("[]", $.tuple(), [])
benchShape("[u128]", $.tuple($.u128), [123n])
benchShape("[u128, u128]", $.tuple($.u128, $.u128), [123n, 456n])
benchShape("[u128, u128, u128]", $.tuple($.u128, $.u128, $.u128), [123n, 456n, 789n])
