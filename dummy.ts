import { Encoder } from "/common.ts";

class DummyEncoderCtor extends Encoder<any> {
  constructor() {
    super(
      (_state, _value) => {},
      (_value) => {
        return 0;
      },
    );
  }
}

export const DummyEncoder = <E extends Encoder>(): E => {
  return new DummyEncoderCtor() as E;
};
