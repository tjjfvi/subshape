import * as $ from "../../mod.ts"
import { benchShape } from "../../test-util.ts"

benchShape("u8", $.u8, 123)
benchShape("u16", $.u16, 123)
benchShape("u32", $.u32, 123)
benchShape("u64", $.u64, 123n)
benchShape("u128", $.u128, 123n)

benchShape("i8", $.i8, 123)
benchShape("i16", $.i16, 123)
benchShape("i32", $.i32, 123)
benchShape("i64", $.i64, 123n)
benchShape("i128", $.i128, 123n)
