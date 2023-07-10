// import * as $ from "https://deno.land/x/scale/mod.ts";
import * as $ from "../mod.ts"
import { $myError } from "./objects.eg.ts"

$.option($.u32) // Shape<number | undefined>
$.optionBool // Shape<boolean | undefined> (stores as single byte; see OptionBool in Rust impl)

export const $myResult = $.result($.str, $myError)

$myResult // Shape<string | MyError>

export const $animal = $.taggedUnion("type", [
  $.variant("dog", $.field("bark", $.str)),
  $.variant("cat", $.field("purr", $.str)),
])

$animal
// Shape<
//   | { type: "dog"; bark: string }
//   | { type: "cat"; purr: string }
// >

export const $pet = $.object(
  $animal,
  $.field("name", $.str),
)

$pet
// Shape<
//   | { type: "dog"; bark: string; name: string }
//   | { type: "cat"; purr: string; name: string }
// >

export const $dinosaur = $.literalUnion([
  "Liopleurodon",
  "Kosmoceratops",
  "Psittacosaurus",
])

$dinosaur // Shape<"Liopleurodon" | "Kosmoceratops" | "Psittacosaurus">

export enum InterestingU8 {
  Min = 0,
  Unit = 1,
  EvenPrime = 2,
  LargestPerfect = 28,
  FirstUninteresting = 129,
  LargestSquare = 225,
  Max = 255,
}

export const $interestingU8 = $.u8 as $.Shape<InterestingU8>

$interestingU8 // Shape<InterestingU8>
