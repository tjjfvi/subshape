import { Codec, Native } from "/common.ts";
import { u8 } from "/int.ts";

export class Option<SomeCodec extends Codec> extends Codec<Native<SomeCodec> | undefined> {
  constructor(readonly someCodec: SomeCodec) {
    super(
      (value) => {
        return value ? someCodec._s(value) + 1 : 1;
      },
      (cursor, value) => {
        cursor.view.setUint8(cursor.i, Number(!!value));
        cursor.i++;
        if (value) {
          someCodec._e(cursor, value);
        }
      },
      (cursor) => {
        switch (u8._d(cursor) as 0 | 1) {
          case 0: {
            return undefined;
          }
          case 1: {
            return someCodec._d(cursor);
          }
        }
      },
    );
  }
}
export const option = <SomeCodec extends Codec>(someCodec: SomeCodec): Option<SomeCodec> => {
  return new Option(someCodec);
};
