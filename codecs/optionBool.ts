import { Codec, createCodec, metadata } from "../common/mod.ts";

export const optionBool: Codec<boolean | undefined> = createCodec({
  _metadata: metadata("$.optionBool"),
  _staticSize: 1,
  _encode(buffer, value) {
    buffer.array[buffer.index++] = value === undefined ? 0 : 1 + +!value;
  },
  _decode(buffer) {
    const byte = buffer.array[buffer.index++]!;
    return byte === 0 ? undefined : !(byte - 1);
  },
  _assert(assert) {
    if (assert.value === undefined) return;
    assert.typeof(this, "boolean");
  },
});
