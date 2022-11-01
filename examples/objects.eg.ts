// import * as $ from "https://deno.land/x/scale/mod.ts";
import * as $ from "../mod.ts";

export const $superhero = $.object(
  ["pseudonym", $.str],
  ["secretIdentity", $.option($.str)],
  ["superpowers", $.array($.str)],
);

$superhero;
// Codec<{
//   pseudonym: string;
//   secretIdentity: string | undefined;
//   superpowers: string[];
// }>

class MyError extends Error {
  code;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}

export const $myError = $.instance(
  MyError,
  // Entries should correspond to both properties and constructor arguments
  ["code", $.u8],
  ["message", $.str],
);

$myError; // Codec<MyError>
