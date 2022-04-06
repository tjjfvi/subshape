import { Codec, Native } from "/common.ts";
import { u8 } from "/int.ts";

export class Option<Some extends Codec> extends Codec<Native<Some> | undefined> {
  constructor(readonly some: Some) {
    super(
      (value) => {
        return value ? some._s(value) + 1 : 1;
      },
      (cursor, value) => {
        cursor.view.setUint8(cursor.i, Number(!!value));
        cursor.i++;
        if (value) {
          some._e(cursor, value);
        }
      },
      (cursor) => {
        switch (u8._d(cursor) as 0 | 1) {
          case 0: {
            return undefined;
          }
          case 1: {
            return some._d(cursor);
          }
        }
      },
    );
  }
}
