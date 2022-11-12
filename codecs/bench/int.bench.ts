import * as $ from "../../mod.ts"
import { benchCodec } from "../../test-util.ts"

benchCodec("u8", $.u8, 123)
benchCodec("u16", $.u16, 123)
benchCodec("u32", $.u32, 123)
benchCodec("u64", $.u64, 123n)
benchCodec("u128", $.u128, 123n)

benchCodec("i8", $.i8, 123)
benchCodec("i16", $.i16, 123)
benchCodec("i32", $.i32, 123)
benchCodec("i64", $.i64, 123n)
benchCodec("i128", $.i128, 123n)
