// import * as $ from "https://deno.land/x/scale/mod.ts";
import * as $ from "../mod.ts"

$.bool // Shape<boolean>

$.u8 // Shape<number>
$.i8 // Shape<number>
$.u16 // Shape<number>
$.i16 // Shape<number>
$.u32 // Shape<number>
$.i32 // Shape<number>

$.u64 // Shape<bigint>
$.i64 // Shape<bigint>
$.u128 // Shape<bigint>
$.i128 // Shape<bigint>
$.u256 // Shape<bigint>
$.i256 // Shape<bigint>

// https://docs.substrate.io/reference/scale-shape/#fnref-1
$.compact($.u8) // Shape<number>
$.compact($.u16) // Shape<number>
$.compact($.u32) // Shape<number>
$.compact($.u64) // Shape<bigint>
$.compact($.u128) // Shape<bigint>
$.compact($.u256) // Shape<bigint>

$.str // Shape<string>

// (encodes as 0 bytes, and always decodes as a constant value)
$.constant(null) // Shape<null>

// (throws if reached)
$.never // Shape<never>
