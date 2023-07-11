import { createShape, metadata, Shape, ShapeDecodeError } from "../common/mod.ts"
import { compact } from "./compact.ts"
import { u32 } from "./int.ts"

const compactU32 = compact(u32)

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()
export const str: Shape<string> = createShape({
  metadata: metadata("$.str"),
  staticSize: compactU32.staticSize,
  subEncode(buffer, value) {
    const array = textEncoder.encode(value)
    compactU32.subEncode(buffer, array.length)
    buffer.insertArray(array)
  },
  subDecode(buffer) {
    const len = compactU32.subDecode(buffer)
    if (buffer.array.length < buffer.index + len) {
      throw new ShapeDecodeError(this, buffer, "Attempting to `str`-decode beyond bounds of input bytes")
    }
    const slice = buffer.array.subarray(buffer.index, buffer.index + len)
    buffer.index += len
    return textDecoder.decode(slice)
  },
  subAssert(assert) {
    assert.typeof(this, "string")
  },
})
