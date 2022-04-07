import { Codec } from "/common.ts";

export type NativeTuple<Els extends Codec[]> = {
  [I in keyof Els]: NativeTuple._0<Els[I]>;
};
namespace NativeTuple {
  export type _0<I> = I extends Codec<infer T> ? T : I;
}

export class Tuple<ElementCodecs extends Codec[] = Codec[]> extends Codec<NativeTuple<ElementCodecs>> {
  constructor(...elCodecs: ElementCodecs) {
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
        for (let i = 0; i < value.length; i++) {
          elCodecs[i]!._e(cursor, value[i]);
        }
      },
      (cursor) => {
        return elCodecs.map((elCodec) => {
          return elCodec._d(cursor);
        }) as NativeTuple<ElementCodecs>;
      },
    );
  }
}
