import { createShape, metadata, Shape } from "../common/mod.ts"
import { compact } from "./compact.ts"
import { u32 } from "./int.ts"

const compactU32 = compact(u32)

export function lenPrefixed<I, O>($inner: Shape<I, O>): Shape<I, O> {
  return createShape({
    metadata: metadata("$.lenPrefixed", lenPrefixed, $inner),
    staticSize: compactU32.staticSize + $inner.staticSize,
    subEncode(buffer, extrinsic) {
      const lengthCursor = buffer.createCursor(compactU32.staticSize)
      const contentCursor = buffer.createCursor($inner.staticSize)
      $inner.subEncode(contentCursor, extrinsic)
      buffer.waitForBuffer(contentCursor, () => {
        const length = contentCursor.finishedSize + contentCursor.index
        compactU32.subEncode(lengthCursor, length)
        lengthCursor.close()
        contentCursor.close()
      })
    },
    subDecode(buffer) {
      const length = compactU32.subDecode(buffer)
      return $inner.decode(buffer.array.subarray(buffer.index, buffer.index += length))
    },
    subAssert(assert) {
      $inner.subAssert(assert)
    },
  })
}
