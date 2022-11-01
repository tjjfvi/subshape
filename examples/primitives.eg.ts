// import * as $ from "https://deno.land/x/scale/mod.ts";
import * as $ from "../mod.ts";

$.bool; // Codec<boolean>

$.u8; // Codec<number>
$.i8; // Codec<number>
$.u16; // Codec<number>
$.i16; // Codec<number>
$.u32; // Codec<number>
$.i32; // Codec<number>

$.u64; // Codec<bigint>
$.i64; // Codec<bigint>
$.u128; // Codec<bigint>
$.i128; // Codec<bigint>
$.u256; // Codec<bigint>
$.i256; // Codec<bigint>

// https://docs.substrate.io/reference/scale-codec/#fnref-1
$.compact($.u8); // Codec<number>
$.compact($.u16); // Codec<number>
$.compact($.u32); // Codec<number>
$.compact($.u64); // Codec<bigint>
$.compact($.u128); // Codec<bigint>
$.compact($.u256); // Codec<bigint>

$.str; // Codec<string>

// (encodes as 0 bytes, and always decodes as a constant value)
$.dummy(null); // Codec<null>

// (throws if reached)
$.never; // Codec<never>
