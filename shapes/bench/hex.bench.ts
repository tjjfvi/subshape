import * as $ from "../../mod.ts"
import { decodeHex, encodeHex } from "../../mod.ts"
import { benchShape } from "../../test-util.ts"

const words = await Deno.readFile("words.txt")
const cargoLock = await Deno.readFile("Cargo.lock")
const cases = [
  new Uint8Array(),
  new Uint8Array(128),
  words,
  cargoLock,
  new Uint8Array(Array(1000).fill([...words]).flat()),
]

Deno.bench(" ", () => {})

for (const data of cases) {
  const encoded = encodeHex(data)
  decodeHex(encoded)
  Deno.bench(`encode ${data.length} bytes`, () => {
    encodeHex(data)
  })
  Deno.bench(`decode ${data.length} bytes`, () => {
    decodeHex(encoded)
  })
}

const $unsizedHex = $.hex($.uint8Array)
for (const data of cases) {
  benchShape(`$unsizedHex ${data.length} bytes`, $unsizedHex, encodeHex(data))
}

for (const data of cases) {
  const $sizedHex = $.hex($.sizedUint8Array(data.length))
  benchShape(`$sizedHex ${data.length} bytes`, $sizedHex, encodeHex(data))
}
