import { Codec, createCodec, metadata } from "../common/mod.ts"

export const bool: Codec<boolean> = createCodec({
  _metadata: metadata("$.bool"),
  _staticSize: 1,
  _encode(buffer, value) {
    buffer.array[buffer.index++] = +value
  },
  _decode(buffer) {
    return !!buffer.array[buffer.index++]!
  },
  _assert(assert) {
    assert.typeof(this, "boolean")
  },
})
