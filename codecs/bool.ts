import { Codec, createCodec, metadata, ScaleAssertError } from "../common/mod.ts";

export const bool: Codec<boolean> = createCodec({
  _metadata: metadata("$.bool"),
  _staticSize: 1,
  _encode(buffer, value) {
    buffer.array[buffer.index++] = +value;
  },
  _decode(buffer) {
    return !!buffer.array[buffer.index++]!;
  },
  _assert(value) {
    if (typeof value !== "boolean") {
      throw new ScaleAssertError(this, value, `typeof value !== "boolean"`);
    }
  },
});
