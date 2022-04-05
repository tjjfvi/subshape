import { ByteLen, Decoder, Encoder } from "/common.ts";
import { u8Decoder } from "/int.ts";

/** Decode a boolean */
export const boolDecoder = new Decoder<boolean>((cursor) => {
  return !!u8Decoder._d(cursor);
});

/** Encode a boolean */
export const boolEncoder = new Encoder<boolean>(
  (cursor, value) => {
    cursor.view.setUint8(cursor.i, Number(value));
    cursor.i += ByteLen._1;
  },
  () => {
    return ByteLen._1;
  },
);
