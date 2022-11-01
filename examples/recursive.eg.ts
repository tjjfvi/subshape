// import * as $ from "https://deno.land/x/scale/mod.ts";
import * as $ from "../mod.ts";
import { $interestingU8, $pet, InterestingU8 } from "./unions.eg.ts";

// TS can't (generally) infer recursive types, so we must explicitly type Person.

interface Person {
  name: string;
  favoriteU8: InterestingU8;
  pets: $.Native<typeof $pet>[];
  children: Person[];
}

const $person: $.Codec<Person> = $.object(
  ["name", $.str],
  ["favoriteU8", $interestingU8],
  ["pets", $.array($pet)],
  ["children", $.array($.deferred(() => $person))],
);
