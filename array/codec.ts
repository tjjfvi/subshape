import { Codec } from "../common.ts";
import { compact } from "../compact/codec.ts";

export class SizedArray<
  El,
  Len extends number,
> extends Codec<El[]> {
  constructor(
    elCodec: Codec<El>,
    len: Len,
  ) {
    super(
      (value) => {
        let sum = 0;
        for (let i = 0; i < len; i += 1) {
          sum += elCodec._s(value[i]!);
        }
        return sum;
      },
      (cursor, value) => {
        for (let i = 0; i < len; i += 1) {
          elCodec._e(cursor, value[i]!);
        }
      },
      (cursor) => {
        const result: El[] = [];
        for (let i = 0; i < len; i += 1) {
          result.push(elCodec._d(cursor));
        }
        return result as El[] & { length: Len };
      },
    );
  }
}
export const sizedArray = <
  El,
  Len extends number,
>(
  elCodec: Codec<El>,
  len: Len,
): SizedArray<El, Len> => {
  return new SizedArray(elCodec, len);
};

export class Array<El> extends Codec<El[]> {
  constructor(elCodec: Codec<El>) {
    super(
      (value) => {
        return compact._s(value.length) + new SizedArray(elCodec, value.length)._s(value);
      },
      (cursor, value) => {
        compact._e(cursor, value.length);
        new SizedArray(elCodec, value.length)._e(cursor, value);
      },
      (cursor) => {
        return new SizedArray(elCodec, Number(compact._d(cursor)))._d(cursor);
      },
    );
  }
}
export const array = <El>(elCodec: Codec<El>): Array<El> => {
  return new Array(elCodec);
};
