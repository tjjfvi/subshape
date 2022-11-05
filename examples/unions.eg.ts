// import * as $ from "https://deno.land/x/scale/mod.ts";
import * as $ from "../mod.ts";
import { $myError } from "./objects.eg.ts";

$.option($.u32); // Codec<number | undefined>
$.optionBool; // Codec<boolean | undefined> (stores as single byte; see OptionBool in Rust impl)

export const $myResult = $.result($.str, $myError);

$myResult; // Codec<string | MyError>

export const $animal = $.taggedUnion("type", [
  ["dog", ["bark", $.str]],
  ["cat", ["purr", $.str]],
]);

$animal;
// Codec<
//   | { type: "dog"; bark: string }
//   | { type: "cat"; purr: string }
// >

export const $pet = $.spread(
  $animal,
  $.object(["name", $.str]),
);

$pet;
// Codec<
//   | { type: "dog"; bark: string; name: string }
//   | { type: "cat"; purr: string; name: string }
// >

export const $dinosaur = $.stringUnion([
  "Liopleurodon",
  "Kosmoceratops",
  "Psittacosaurus",
]);

$dinosaur; // Codec<"Liopleurodon" | "Kosmoceratops" | "Psittacosaurus">

export enum InterestingU8 {
  Min = 0,
  Unit = 1,
  EvenPrime = 2,
  LargestPerfect = 28,
  FirstUninteresting = 129,
  LargestSquare = 225,
  Max = 255,
}

export const $interestingU8 = $.u8 as $.Codec<InterestingU8>;

$interestingU8; // Codec<InterestingU8>
