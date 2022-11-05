import { Codec, createCodec, metadata, ValidateError } from "../common/mod.ts";

export const bool: Codec<boolean> = createCodec({
  _metadata: metadata("$.bool"),
  _staticSize: 1,
  _encode(buffer, value) {
    buffer.array[buffer.index++] = +value;
  },
  _decode(buffer) {
    return !!buffer.array[buffer.index++]!;
  },
  _validate(value) {
    if (typeof value !== "boolean") {
      throw new ValidateError(this, value, `typeof value !== "boolean"`);
    }
  },
});
