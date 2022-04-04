import { Decoder, Encoder, Transcoder } from "/common.ts";

export type NativeTuple<Els extends Transcoder[]> = {
  [I in keyof Els]: NativeTuple._0<Els[I]>;
};
namespace NativeTuple {
  export type _0<I> = I extends Transcoder<infer T> ? T : I;
}

/** Decode a tuple */
export class TupleDecoder<ElementDecoders extends Decoder[]> extends Decoder<NativeTuple<ElementDecoders>> {
  /**
   * @param elDecoders The ordered tuple element decoders
   */
  constructor(...elDecoders: ElementDecoders) {
    super((state) => {
      return elDecoders.map((elDecoder) => {
        return elDecoder._d(state);
      }) as NativeTuple<ElementDecoders>;
    });
  }
}

/** Encode a tuple */
export class TupleEncoder<ElEncoders extends Encoder[]> extends Encoder<NativeTuple<ElEncoders>> {
  /**
   * @param elEncoders The ordered tuple element encoders
   */
  constructor(...elEncoders: ElEncoders) {
    super(
      (state, value) => {
        for (let i = 0; i < value.length; i++) {
          elEncoders[i]!._e(state, value[i]);
        }
      },
      (value) => {
        let size = 0;
        let i = value.length;
        while (--i >= 0) {
          size += elEncoders[i]!._s(value[i]);
        }
        return size;
      },
    );
  }
}
