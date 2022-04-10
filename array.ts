import { Codec, Native } from "./common.ts";
import { compact } from "./compact.ts";

export type NativeArray<
  ElCodec extends Codec,
  Len extends number = number,
> = Native<ElCodec>[] & { length: Len };

export class SizedArray<
  ElCodec extends Codec,
  Len extends number,
> extends Codec<NativeArray<ElCodec, Len>> {
  constructor(
    elCodec: ElCodec,
    len: Len,
  ) {
    super(
      (value) => {
        let sum = 0;
        for (let i = 0; i < len; i += 1) {
          sum += elCodec._s(value[i]);
        }
        return sum;
      },
      (cursor, value) => {
        for (let i = 0; i < len; i += 1) {
          elCodec._e(cursor, value[i]);
        }
      },
      (cursor) => {
        const result: Native<ElCodec>[] = [];
        for (let i = 0; i < len; i += 1) {
          result.push(elCodec._d(cursor));
        }
        return result as NativeArray<ElCodec, Len>;
      },
    );
  }
}
export const sizedArray = <
  ElCodec extends Codec,
  Len extends number,
>(
  elCodec: ElCodec,
  len: Len,
): SizedArray<ElCodec, Len> => {
  return new SizedArray(elCodec, len);
};

export class Array<ElCodec extends Codec> extends Codec<NativeArray<ElCodec>> {
  constructor(elCodec: ElCodec) {
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
export const array = <ElCodec extends Codec>(elCodec: ElCodec): Array<ElCodec> => {
  return new Array(elCodec);
};
