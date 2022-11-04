import { Codec, createCodec, DecodeError, EncodeError, metadata } from "../common/mod.ts";

export const never: Codec<never> = createCodec({
  _metadata: metadata("$.never"),
  _staticSize: 0,
  _encode(value) {
    throw new EncodeError(this, value, "Cannot encode $.never");
  },
  _decode(buffer) {
    throw new DecodeError(this, buffer, "Cannot decode $.never");
  },
});
