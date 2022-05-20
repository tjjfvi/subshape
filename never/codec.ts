import { createCodec } from "../common.ts";

export const never = createCodec<never>({
  _staticSize: 0,
  _encode() {
    throw new Error("Cannot encode $.never");
  },
  _decode() {
    throw new Error("Cannot decode $.never");
  },
});
