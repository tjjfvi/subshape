import * as $ from "../../mod.ts";
import { testCodec } from "../../test-util.ts";

const $person = $.withMetadata(
  $.metadata("$person"),
  $.object(
    ["name", $.str],
    ["nickName", $.str],
    ["superPower", $.option($.str)],
    ["luckyNumber", $.u8],
  ),
);

testCodec($person, [
  {
    name: "Darrel",
    nickName: "The Durst",
    superPower: "telekinesis",
    luckyNumber: 9,
  },
  {
    name: "Michael",
    nickName: "Mike",
    superPower: undefined,
    luckyNumber: 7, // Cummon... be more predictable!
  },
]);
