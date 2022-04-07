import { Codec, Native } from "/common.ts";
import { compact } from "/compact.ts";

export type NativeArray<
  El extends Codec,
  Len extends number = number,
> = Native<El>[] & { length: Len };

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
        for (let i = 0; i < len; i++) {
          sum += elCodec._s(value[i]);
        }
        return sum;
      },
      (cursor, value) => {
        for (let i = 0; i < len; i++) {
          elCodec._e(cursor, value[i]);
        }
      },
      (cursor) => {
        const result: Native<ElCodec>[] = [];
        for (let i = 0; i < len; i++) {
          result.push(elCodec._d(cursor));
        }
        return result as NativeArray<ElCodec, Len>;
      },
    );
  }
}

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
