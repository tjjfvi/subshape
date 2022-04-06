import { Codec, Cursor, Native } from "/common.ts";

// TODO: clean this up! Consistency
export const Literal = <E extends Codec>(
  value: Native<E>,
  consume?: (cursor: Cursor) => void,
  bytes?: Uint8Array,
): E => {
  return new Codec(
    (_value) => {
      return bytes?.length || 0;
    },
    (cursor) => {
      if (bytes) {
        for (let i = 0; i < bytes.length; i++) {
          cursor.view.setUint8(cursor.i, bytes[i]!);
          cursor.i += 1;
        }
      }
    },
    (cursor) => {
      if (consume) {
        consume(cursor);
      }
      return value;
    },
  ) as any;
};
