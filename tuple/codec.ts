import { Codec } from "../common.ts";

export type NativeTuple<ElCodecs extends Codec[]> = {
  [I in keyof ElCodecs]: NativeTuple._0<ElCodecs[I]>;
};
namespace NativeTuple {
  export type _0<I> = I extends Codec<infer T> ? T : I;
}

export class Tuple<ElCodecs extends Codec[] = Codec[]> extends Codec<NativeTuple<ElCodecs>> {
  constructor(...elCodecs: ElCodecs) {
    super(
      (value) => {
        let size = 0;
        let i = value.length;
        while (--i >= 0) {
          size += elCodecs[i]!._s(value[i]);
        }
        return size;
      },
      (cursor, value) => {
        for (let i = 0; i < value.length; i += 1) {
          elCodecs[i]!._e(cursor, value[i]);
        }
      },
      (cursor) => {
        return elCodecs.map((elCodec) => {
          return elCodec._d(cursor);
        }) as NativeTuple<ElCodecs>;
      },
    );
  }
}

export const tuple = <ElCodecs extends Codec[]>(...elCodecs: ElCodecs): Tuple<ElCodecs> => {
  return new Tuple(...elCodecs);
};
