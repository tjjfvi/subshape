import { Codec, createCodec, DecodeError, EncodeError } from "../common/mod.ts";

export const never: Codec<never> = createCodec({
  name: "$.never",
  _metadata: null,
  _staticSize: 0,
  _encode(value) {
    throw new EncodeError(this, value, "Cannot encode $.never");
  },
  _decode(buffer) {
    throw new DecodeError(this, buffer, "Cannot decode $.never");
  },
});
