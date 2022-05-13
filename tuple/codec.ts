import { Codec, Cursor } from "../common.ts";

export type NativeTuple<ElCodecs extends Codec[]> = {
  [I in keyof ElCodecs]: ElCodecs[I] extends Codec<infer T> ? T : never;
};

export class TupleCodec<ElCodecs extends Codec[] = Codec[]> extends Codec<NativeTuple<ElCodecs>> {
  readonly elCodecs;
  readonly _minSize;
  readonly dynSizeEls;
  constructor(...elCodecs: ElCodecs) {
    super();
    this.elCodecs = elCodecs;
    this._minSize = elCodecs.reduce((len, field) => len + field._minSize, 0);
    this.dynSizeEls = elCodecs.map((field, i) => [i, field] as const).filter(([_, field]) => !field._dynSizeZero);
    this._dynSizeZero = this.dynSizeEls.length === 0;
  }
  _dynSize(value: NativeTuple<ElCodecs>) {
    let sum = 0;
    for (let i = 0; i < this.dynSizeEls.length; i++) {
      const [k, elCodec] = this.dynSizeEls[i]!;
      sum += elCodec!._dynSize(value[k]);
    }
    return sum;
  }
  _encode(cursor: Cursor, value: NativeTuple<ElCodecs>) {
    for (let i = 0; i < value.length; i += 1) {
      this.elCodecs[i]!._encode(cursor, value[i]);
    }
  }
  _decode(cursor: Cursor) {
    const arr = Array(this.elCodecs.length);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = this.elCodecs[i]!._decode(cursor);
    }
    return arr as NativeTuple<ElCodecs>;
  }
}

export const tuple = <ElCodecs extends Codec[]>(...elCodecs: ElCodecs): TupleCodec<ElCodecs> => {
  return new TupleCodec(...elCodecs);
};
