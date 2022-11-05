// import * as $ from "https://deno.land/x/scale/mod.ts";
import * as $ from "../mod.ts";

$.set($.u32); // Codec<Set<number>>

$.map($.str, $.u32); // Codec<Map<string, number>>

export const $record = $.transform<
  [string, number][],
  Record<string, number>
>({
  $base: $.array($.tuple($.str, $.u32)),
  encode: Object.entries,
  decode: Object.fromEntries,
});

$record; // Codec<Record<string, number>>
