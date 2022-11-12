// import * as $ from "https://deno.land/x/scale/mod.ts";
import * as $ from "../mod.ts"

$.array($.u32) // Codec<number[]>
$.sizedArray($.u32, 2) // Codec<[number, number]>

$.uint8Array // Codec<Uint8Array>
$.sizedUint8Array(32) // Codec<Uint8Array>

$.tuple($.bool, $.u8, $.str) // Codec<[boolean, number, string]>

// like boolean[] but backed by an ArrayBuffer
$.bitSequence // Codec<BitSequence>
