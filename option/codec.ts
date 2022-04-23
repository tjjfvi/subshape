import { Codec } from "../common.ts";
import { u8 } from "../int/codec.ts";

export class Option<Some> extends Codec<Some | undefined> {
  constructor(someCodec: Codec<Some>) {
    super(
      (value) => {
        return 1 + (value === undefined ? 0 : someCodec._s(value));
      },
      (cursor, value) => {
        cursor.view.setUint8(cursor.i, value === undefined ? 0 : 1);
        cursor.i += 1;
        if (value !== undefined) {
          someCodec._e(cursor, value);
        }
      },
      (cursor) => {
        switch (u8._d(cursor)) {
          case 0: {
            return undefined;
          }
          case 1: {
            return someCodec._d(cursor);
          }
          default: {
            throw new Error("Could not decode Option as `Some(_)` nor `None`");
          }
        }
      },
    );
  }
}
export const option = <Some>(someCodec: Codec<Some>): Option<Some> => {
  return new Option(someCodec);
};
