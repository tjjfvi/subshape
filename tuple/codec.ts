import { Codec, Cursor } from "../common.ts";

export type NativeTuple<ElCodecs extends Codec[]> = {
  [I in keyof ElCodecs]: ElCodecs[I] extends Codec<infer T> ? T : never;
};

export class TupleCodec<ElCodecs extends Codec[] = Codec[]> extends Codec<NativeTuple<ElCodecs>> {
  readonly elCodecs;
  constructor(...elCodecs: ElCodecs) {
    super();
    this.elCodecs = elCodecs;
  }
  _size(value: NativeTuple<ElCodecs>) {
    let size = 0;
    let i = value.length;
    while (--i >= 0) {
      size += this.elCodecs[i]!._size(value[i]);
    }
    return size;
  }
  _encode(cursor: Cursor, value: NativeTuple<ElCodecs>) {
    for (let i = 0; i < value.length; i += 1) {
      this.elCodecs[i]!._encode(cursor, value[i]);
    }
  }
  _decode(cursor: Cursor) {
    return this.elCodecs.map((elCodec) => {
      return elCodec._decode(cursor);
    }) as NativeTuple<ElCodecs>;
  }
}

export const tuple = <ElCodecs extends Codec[]>(...elCodecs: ElCodecs): TupleCodec<ElCodecs> => {
  return new TupleCodec(...elCodecs);
};
