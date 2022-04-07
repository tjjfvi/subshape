import { Codec } from "/common.ts";
import { u8 } from "/int.ts";

export class Bool extends Codec<boolean> {
  constructor() {
    super(() => {
      return 1;
    }, (cursor, value) => {
      cursor.view.setUint8(cursor.i, Number(value));
      cursor.i += 1;
    }, (cursor) => {
      return !!u8._d(cursor);
    });
  }
}

export const bool = new Bool();
