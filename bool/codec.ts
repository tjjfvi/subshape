import { Codec, Cursor } from "../common.ts";

export const bool = new class BoolCodec extends Codec<boolean> {
  _size() {
    return 1;
  }

  _encode(cursor: Cursor, value: boolean) {
    cursor.view.setUint8(cursor.i, Number(value));
    cursor.i += 1;
  }

  _decode(cursor: Cursor) {
    return !!cursor.u8a[cursor.i++];
  }
}();
