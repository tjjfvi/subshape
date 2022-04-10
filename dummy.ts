import { Codec, Native } from "/common.ts";

/**
 * `Dummy`'s decoder returns a hard-coded JS value and DOES NOT encode any bytes.
 * @param value The native value corresponding to the generically-supplied codec
 * @returns A dummy codec with the patched signature of `E`
 */
export const dummy = <DummyOfCodec extends Codec>(value: Native<DummyOfCodec>): DummyOfCodec => {
  return new Codec(
    (_value) => {
      return 0;
    },
    (_cursor) => {},
    (_cursor) => {
      return value;
    },
  ) as DummyOfCodec;
};
