// import * as $ from "https://deno.land/x/scale/mod.ts";
import * as $ from "../mod.ts"

$.set($.u32) // Codec<Set<number>>

$.map($.str, $.u32) // Codec<Map<string, number>>

$.record($.u8) // Codec<Partial<Record<string, number>>>
