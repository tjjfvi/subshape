import { Codec, createCodec } from "../common.ts";

export const never: Codec<never> = createCodec({
  name: "never",
  _metadata: null,
  _staticSize: 0,
  _encode() {
    throw new Error("Cannot encode $.never");
  },
  _decode() {
    throw new Error("Cannot decode $.never");
  },
});
