import * as $ from "./mod.ts";

let x = 123 as unknown;
$.assert($.u8, x);
x;
