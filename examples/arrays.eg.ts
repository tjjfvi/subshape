// import * as $ from "https://deno.land/x/scale/mod.ts";
import * as $ from "../mod.ts"

$.array($.u32) // Shape<number[]>
$.sizedArray($.u32, 2) // Shape<[number, number]>

$.uint8Array // Shape<Uint8Array>
$.sizedUint8Array(32) // Shape<Uint8Array>

$.tuple($.bool, $.u8, $.str) // Shape<[boolean, number, string]>

// like boolean[] but backed by an ArrayBuffer
$.bitSequence // Shape<BitSequence>
