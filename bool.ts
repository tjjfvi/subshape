import { ByteLen, Decoder, Encoder } from "/common.ts";
import { u8Decoder } from "/int.ts";

/** Decode a boolean */
export const boolDecoder = new Decoder<boolean>((state) => {
  return !!u8Decoder._d(state);
});

/** Encode a boolean */
export const boolEncoder = new Encoder<boolean>(
  (state, value) => {
    state.view.setUint8(state.i, Number(value));
    state.i += ByteLen._1;
  },
  () => {
    return ByteLen._1;
  },
);
