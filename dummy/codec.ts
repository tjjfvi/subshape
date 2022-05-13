import { Codec, Native } from "../common.ts";

class DummyCodec<T> extends Codec<T> {
  constructor(readonly value: T) {
    super();
  }
  _minSize = 0;
  _encode() {}
  _decode() {
    return this.value;
  }
}

/**
 * `Dummy`'s decoder returns a hard-coded JS value and DOES NOT encode or decode from any bytes.
 * @param value The native value corresponding to the generically-supplied codec
 * @returns A dummy codec with the patched signature of `E`
 */
export const dummy = <DummyOfCodec extends Codec>(value: Native<DummyOfCodec>): DummyOfCodec => {
  return new DummyCodec(value) as any as DummyOfCodec;
};
