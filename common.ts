export class State {
  view;
  i = 0;

  constructor(readonly u8a: Uint8Array) {
    this.view = new DataView(u8a.buffer, u8a.byteOffset, u8a.byteLength);
  }
}

export type Transcoder<Native = any> = Encoder<Native> | Decoder<Native>;
export type Native<Transcoder_ extends Transcoder> = Transcoder_ extends Transcoder<infer Native> ? Native : never;

export class Decoder<T = any> {
  constructor(readonly _d: (state: State) => T) {}

  decode = (u8a: Uint8Array): T => {
    return this._d(new State(u8a));
  };
}

export class Encoder<T = any> {
  constructor(
    readonly _e: (
      state: State,
      value: T,
    ) => void,
    readonly _s: (value: T) => number,
  ) {}

  encode = (decoded: T): Uint8Array => {
    const state = new State(new Uint8Array(this._s(decoded)));
    this._e(state, decoded);
    return state.u8a;
  };
}

export const enum ByteLen {
  _1 = 1,
  _2 = 1 << 1,
  _4 = 1 << 2,
  _8 = 1 << 3,
  _16 = 1 << 4,
}
