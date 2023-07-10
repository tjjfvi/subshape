import { createShape, metadata, Shape, ShapeDecodeError } from "../common/mod.ts"

export function constant<T>(value: T, shape: Pick<Shape<T>, "encode">): Shape<T>
export function constant<T>(value: T, pattern?: Uint8Array): Shape<T>
export function constant<T>(value: T, c?: Pick<Shape<T>, "encode"> | Uint8Array): Shape<T> {
  const pattern = c && (c instanceof Uint8Array ? c : c.encode(value))
  return createShape({
    metadata: metadata("$.constant", constant<T>, value, ...pattern ? [pattern] : []),
    // We could set `staticSize` to `pattern.length`, but in this case it will
    // usually more efficient to insert `pattern` dynamically, rather than
    // manually copy the bytes.
    staticSize: 0,
    subEncode(buffer) {
      if (pattern) {
        buffer.insertArray(pattern)
      }
    },
    subDecode(buffer) {
      if (pattern) {
        const got = buffer.array.subarray(buffer.index, buffer.index += pattern.length)
        for (let i = 0; i < pattern.length; i++) {
          if (pattern[i] !== got[i]) {
            throw new ShapeDecodeError(this, buffer, `Invalid pattern; expected ${hex(pattern)}, got ${hex(got)}`)
          }
        }
      }
      return value
    },
    subAssert(assert) {
      assert.equals(this, value)
    },
  })
}

function hex(pattern: Uint8Array) {
  let str = "0x"
  for (let i = 0; i < pattern.length; i++) {
    str += pattern[i]!.toString(16).padStart(2, "0")
  }
  return str
}
