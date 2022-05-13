import { Codec, Cursor } from "../common.ts";
import { compact } from "../compact/codec.ts";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const str = new class StrCodec extends Codec<string> {
  _minSize = compact._minSize;
  _dynSize(value: string) {
    const len = value.length && textEncoder.encode(value).length;
    return len + compact._dynSize(len);
  }
  _encode(cursor: Cursor, value: string) {
    const len = value.length && textEncoder.encode(value).length;
    compact._encode(cursor, len);
    len && textEncoder.encodeInto(value, cursor.u8a.subarray(cursor.i));
    cursor.i += len;
  }
  _decode(cursor: Cursor) {
    // TODO: do we like this conversion? Safeguard.
    const len = Number(compact._decode(cursor));
    if (!len) return "";
    if (cursor.u8a.length < cursor.i + len) {
      throw new Error("Attempting to `str`-decode beyond bounds of input bytes");
    }
    const slice = cursor.u8a.subarray(cursor.i, cursor.i + len);
    cursor.i += len;
    return textDecoder.decode(slice);
  }
}();
