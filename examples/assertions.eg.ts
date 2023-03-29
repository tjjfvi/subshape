import * as $ from "https://deno.land/x/scale/mod.ts"

// using `$.assert` (no explicit typing required)
const a: unknown = 1
$.assert($.u8, a)
a

// using `Codec.assert` (explicit typing required)
const b: unknown = 2
const u8: $.Codec<number> = $.u8
u8.assert(b)
b
