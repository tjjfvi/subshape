import { Codec, createCodec, metadata, ScaleAssertError, ScaleDecodeError, ScaleEncodeError } from "../common/mod.ts";

export const never: Codec<never> = createCodec({
  _metadata: metadata("$.never"),
  _staticSize: 0,
  _encode(value) {
    throw new ScaleEncodeError(this, value, "Cannot encode $.never");
  },
  _decode(buffer) {
    throw new ScaleDecodeError(this, buffer, "Cannot decode $.never");
  },
  _assert(value) {
    throw new ScaleAssertError(this, value, "Cannot validate $.never");
  },
});
