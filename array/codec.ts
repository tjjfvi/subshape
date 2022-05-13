import { Codec, Cursor } from "../common.ts";
import { compact } from "../compact/codec.ts";

type ArrayOfLenth<
  N extends number,
  T,
  A extends T[] = [],
> = number extends N ? T[]
  : N extends A["length"] ? A
  : ArrayOfLenth<N, T, [...A, T]>;

export class SizedArrayCodec<
  El,
  Len extends number,
> extends Codec<ArrayOfLenth<Len, El>> {
  _size(value: El[]) {
    let sum = 0;
    for (let i = 0; i < this.len; i += 1) {
      sum += this.elCodec._size(value[i]!);
    }
    return sum;
  }
  _encode(cursor: Cursor, value: El[]) {
    for (let i = 0; i < this.len; i += 1) {
      this.elCodec._encode(cursor, value[i]!);
    }
  }
  _decode(cursor: Cursor) {
    const result: El[] = Array(this.len);
    for (let i = 0; i < this.len; i += 1) {
      result[i] = this.elCodec._decode(cursor);
    }
    return result as ArrayOfLenth<Len, El>;
  }
  constructor(
    readonly elCodec: Codec<El>,
    readonly len: Len,
  ) {
    super();
  }
}
export const sizedArray = <
  El,
  Len extends number,
>(
  elCodec: Codec<El>,
  len: Len,
): SizedArrayCodec<El, Len> => {
  return new SizedArrayCodec(elCodec, len);
};

export class ArrayCodec<El> extends Codec<El[]> {
  constructor(readonly elCodec: Codec<El>) {
    super();
  }
  _size(value: El[]) {
    let sum = 0;
    for (let i = 0; i < value.length; i += 1) {
      sum += this.elCodec._size(value[i]!);
    }
    return compact._size(value.length) + sum;
  }
  _encode(cursor: Cursor, value: El[]) {
    compact._encode(cursor, value.length);
    for (let i = 0; i < value.length; i += 1) {
      this.elCodec._encode(cursor, value[i]!);
    }
  }
  _decode(cursor: Cursor) {
    const len = Number(compact._decode(cursor));
    const result: El[] = Array(len);
    for (let i = 0; i < len; i += 1) {
      result[i] = this.elCodec._decode(cursor);
    }
    return result;
  }
}
export const array = <El>(elCodec: Codec<El>): ArrayCodec<El> => {
  return new ArrayCodec(elCodec);
};
