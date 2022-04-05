import { Decoder, Encoder } from "/common.ts";
import { compactDecoder, compactEncoder } from "/compact.ts";

/** Decode a string */
export const strDecoder = new Decoder<string>((cursor) => {
  // TODO: do we like this conversion? Safeguard.
  const len = Number(compactDecoder._d(cursor));
  const slice = cursor.u8a.slice(cursor.i, cursor.i + len);
  cursor.i += len;
  return new TextDecoder().decode(slice);
});

/** Encode a string */
export const strEncoder = new Encoder<string>(
  (cursor, value) => {
    const len = new TextEncoder().encode(value).length;
    compactEncoder._e(cursor, len);
    new TextEncoder().encodeInto(value, cursor.u8a.subarray(cursor.i));
    cursor.i += len;
  },
  (value) => {
    const len = new TextEncoder().encode(value).length;
    return len + compactEncoder._s(len);
  },
);
