import * as $ from "../../mod.ts"
import { testInvalid, testShape } from "../../test-util.ts"
import { encodeHex } from "../hex.ts"

const $unsizedHex = $.hex($.uint8Array)

testShape($unsizedHex, {
  "\"\"": "",
  "\"000102030405\"": "000102030405",
  "\"deadbeef\"": "deadbeef",
  "Cargo.lock": encodeHex(await Deno.readFile("Cargo.lock")),
})

testShape($.hex($.sizedUint8Array(1)), [
  "00",
  "01",
  "ff",
])

testShape($.hex($.sizedUint8Array(16)), [
  "dd0000dd0000eeeeeeee00000cc000cc",
  "dd0000dd0000ee000000000000cccc00",
  "dddddddd0000eeeeeeee0000000cc000",
  "dd0000dd0000ee000000000000cccc00",
  "dd0000dd0000eeeeeeee00000cc000cc",
])

testInvalid($unsizedHex, [
  null,
  0x1234,
  "0y00",
  "hex",
  "0x000000000000000000000.",
  new Uint8Array([0, 1, 2, 3, 4]),
])

testInvalid($.hex($.sizedUint8Array(1)), [
  null,
  0x1234,
  "0y00",
  "hex",
  "0x000000000000000000000.",
  new Uint8Array([0, 1, 2, 3, 4]),
  "0000",
  "",
  "-1",
])
