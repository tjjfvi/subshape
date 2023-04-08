import { Codec, metadata, ScaleAssertError, withMetadata } from "../mod.ts"
import { transform } from "./transform.ts"

const encodeLookup = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"))
const decodeLookup = Array.from({ length: 128 }, (_, i) => parseInt(String.fromCharCode(i), 16) | 0)

export function encodeHex(bytes: Uint8Array): string {
  let str = ""
  for (let i = 0; i < bytes.length; i++) {
    str += encodeLookup[bytes[i]!]
  }
  return str
}

export function encodeHexPrefixed(bytes: Uint8Array) {
  let str = "0x"
  for (let i = 0; i < bytes.length; i++) {
    str += encodeLookup[bytes[i]!]
  }
  return str
}

export function decodeHex(hex: string): Uint8Array {
  if (hex.startsWith("0x")) hex = hex.slice(2)
  if (hex.length % 2 === 1) hex = "0" + hex
  const array = new Uint8Array(hex.length >> 1)
  for (let i = 0; i < array.length; i++) {
    array[i] = (decodeLookup[hex.charCodeAt(i << 1)!]! << 4) | decodeLookup[hex.charCodeAt(i << 1 | 1)!]!
  }
  return array
}

const hexRegex = /^(?:0x)?[\da-f]*$/i
export function hex($inner: Codec<Uint8Array>): Codec<string> {
  return withMetadata(
    metadata("$.hex", hex, $inner),
    transform({
      $base: $inner,
      encode: decodeHex,
      decode: encodeHex,
      assert(assert) {
        assert.typeof(this, "string")
        if (!hexRegex.test(assert.value as string)) {
          throw new ScaleAssertError(this, assert.value, `${assert.path}: invalid hex`)
        }
      },
    }),
  )
}
