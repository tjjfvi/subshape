import { Codec } from "/common.ts";
import { u8 } from "/int.ts";

export const bool = new Codec<boolean>(
  () => {
    return 1;
  },
  (cursor, value) => {
    cursor.view.setUint8(cursor.i, Number(value));
    cursor.i += 1;
  },
  (cursor) => {
    return !!u8._d(cursor);
  },
);
