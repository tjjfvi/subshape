import { Codec } from "./common.ts";
import { compact } from "./compact.ts";

export const str = new Codec<string>(
  (value) => {
    const len = new TextEncoder().encode(value).length;
    return len + compact._s(len);
  },
  (cursor, value) => {
    const len = new TextEncoder().encode(value).length;
    compact._e(cursor, len);
    new TextEncoder().encodeInto(value, cursor.u8a.subarray(cursor.i));
    cursor.i += len;
  },
  (cursor) => {
    // TODO: do we like this conversion? Safeguard.
    const len = Number(compact._d(cursor));
    const slice = cursor.u8a.slice(cursor.i, cursor.i + len);
    cursor.i += len;
    return new TextDecoder().decode(slice);
  },
);
