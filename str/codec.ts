import { Codec, Cursor } from "../common.ts";
import { compact } from "../compact/codec.ts";

export const str = new class StrCodec extends Codec<string> {
  _minSize = compact._minSize;
  _dynSize(value: string) {
    const len = new TextEncoder().encode(value).length;
    return len + compact._dynSize(len);
  }
  _encode(cursor: Cursor, value: string) {
    const len = new TextEncoder().encode(value).length;
    compact._encode(cursor, len);
    new TextEncoder().encodeInto(value, cursor.u8a.subarray(cursor.i));
    cursor.i += len;
  }
  _decode(cursor: Cursor) {
    // TODO: do we like this conversion? Safeguard.
    const len = Number(compact._decode(cursor));
    if (cursor.u8a.length < cursor.i + len) {
      throw new Error("Attempting to `str`-decode beyond bounds of input bytes");
    }
    const slice = cursor.u8a.slice(cursor.i, cursor.i + len);
    cursor.i += len;
    return new TextDecoder().decode(slice);
  }
}();
