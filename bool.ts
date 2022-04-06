import { ByteLen, Codec } from "/common.ts";
import { u8 } from "/int.ts";

export const bool = new Codec<boolean>(
  () => {
    return ByteLen._1;
  },
  (cursor, value) => {
    cursor.view.setUint8(cursor.i, Number(value));
    cursor.i += ByteLen._1;
  },
  (cursor) => {
    return !!u8._d(cursor);
  },
);
