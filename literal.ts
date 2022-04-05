import { Cursor, Decoder, Encoder, Native } from "/common.ts";

export const LiteralEncoder = <E extends Encoder>(bytes?: Uint8Array): E => {
  return new Encoder(
    (cursor) => {
      if (bytes) {
        for (let i = 0; i < bytes.length; i++) {
          cursor.view.setUint8(cursor.i, bytes[i]!);
          cursor.i += 1;
        }
      }
    },
    (_value) => {
      return bytes?.length || 0;
    },
  ) as any;
};

export const LiteralDecoder = <D extends Decoder>(
  value: Native<D>,
  consume?: (cursor: Cursor) => void,
): Native<D> => {
  return new Decoder((cursor) => {
    if (consume) {
      consume(cursor);
    }
    return value;
  }) as any;
};
