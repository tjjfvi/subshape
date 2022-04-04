import { Decoder, Encoder, Native, Transcoder } from "/common.ts";
import { u8Decoder } from "/int.ts";
import * as asserts from "std/testing/asserts.ts";

export type OptionT<SomeTranscoder extends Transcoder> = Native<SomeTranscoder> | undefined;

/** Decode an option type into its "some" value or undefined */
export class OptionDecoder<SomeDecoder extends Decoder> extends Decoder<OptionT<SomeDecoder>> {
  /**
   * @param someDecoder The decoder of the `Some` variant's value
   */
  constructor(readonly someDecoder: SomeDecoder) {
    super((state) => {
      switch (u8Decoder._d(state)) {
        case 0: {
          return undefined;
        }
        case 1: {
          return someDecoder._d(state);
        }
        default: {
          asserts.unreachable();
        }
      }
    });
  }
}

/** Encode a potentially-undefined value into an option */
export class OptionEncoder<SomeEncoder extends Encoder> extends Encoder<OptionT<SomeEncoder>> {
  /**
   * @param someEncoder The encoder to be used on the non-undefined value
   */
  constructor(readonly someEncoder: SomeEncoder) {
    super(
      (state, value) => {
        state.view.setUint8(state.i, Number(!!value));
        state.i++;
        if (value) {
          someEncoder._e(state, value);
        }
      },
      (value) => {
        return value ? someEncoder._s(value) + 1 : 1;
      },
    );
  }
}
