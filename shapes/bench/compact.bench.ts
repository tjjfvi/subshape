import * as $ from "../../mod.ts"
import { benchShape } from "../../test-util.ts"

benchShape("compactU32 (6)", $.compact($.u32), 2 ** 6 - 1)
benchShape("compactU32 (14)", $.compact($.u32), 2 ** 14 - 1)
benchShape("compactU32 (30)", $.compact($.u32), 2 ** 30 - 1)
benchShape("compactU32 (32)", $.compact($.u32), 2 ** 32 - 1)

benchShape("compactU256 (6)", $.compact($.u256), 2n ** 6n - 1n)
benchShape("compactU256 (14)", $.compact($.u256), 2n ** 14n - 1n)
benchShape("compactU256 (30)", $.compact($.u256), 2n ** 30n - 1n)
benchShape("compactU256 (32)", $.compact($.u256), 2n ** 32n - 1n)
benchShape("compactU256 (64)", $.compact($.u256), 2n ** 64n - 1n)
benchShape("compactU256 (128)", $.compact($.u256), 2n ** 128n - 1n)
benchShape("compactU256 (256)", $.compact($.u256), 2n ** 256n - 1n)
