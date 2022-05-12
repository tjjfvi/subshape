import { Codec } from "../common.ts";
import { compact } from "../compact/codec.ts";

type ArrayOfLenth<
  N extends number,
  T,
  A extends T[] = [],
> = number extends N ? T[]
  : N extends A["length"] ? A
  : ArrayOfLenth<N, T, [...A, T]>;

export class SizedArray<
  El,
  Len extends number,
> extends Codec<ArrayOfLenth<Len, El>> {
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
        const result: El[] = globalThis.Array(len);
        for (let i = 0; i < len; i += 1) {
          result[i] = elCodec._d(cursor);
        }
        return result as ArrayOfLenth<Len, El>;
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
        let sum = 0;
        for (let i = 0; i < value.length; i += 1) {
          sum += elCodec._s(value[i]!);
        }
        return compact._s(value.length) + sum;
      },
      (cursor, value) => {
        compact._e(cursor, value.length);
        for (let i = 0; i < value.length; i += 1) {
          elCodec._e(cursor, value[i]!);
        }
      },
      (cursor) => {
        const len = Number(compact._d(cursor));
        const result: El[] = globalThis.Array(len);
        for (let i = 0; i < len; i += 1) {
          result[i] = elCodec._d(cursor);
        }
        return result;
      },
    );
  }
}
export const array = <El>(elCodec: Codec<El>): Array<El> => {
  return new Array(elCodec);
};
