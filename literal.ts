import { Decoder, Encoder } from "/common.ts";

export class LiteralDecoder<T> extends Decoder<T> {
  constructor(readonly value: T) {
    super(() => {
      return value;
    });
  }
}

export class LiteralEncoder<T> extends Encoder<T> {
  constructor(
    readonly encoder: Encoder<T>,
    readonly value: T,
  ) {
    super(
      (state, _value) => {
        encoder._e(state, value);
      },
      () => {
        return encoder._s(value);
      },
    );
  }
}
