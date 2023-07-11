// import * as $ from "https://deno.land/x/subshape/mod.ts";
import * as $ from "../mod.ts"

$.set($.u32) // Shape<Set<number>>

$.map($.str, $.u32) // Shape<Map<string, number>>

$.record($.u8) // Shape<Record<string, number>>
