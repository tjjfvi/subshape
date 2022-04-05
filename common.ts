export class Cursor {
  view;
  i = 0;

  constructor(readonly u8a: Uint8Array) {
    this.view = new DataView(u8a.buffer, u8a.byteOffset, u8a.byteLength);
  }
}

export type Transcoder<Native = any> = Encoder<Native> | Decoder<Native>;
export type Native<Transcoder_ extends Transcoder> = Transcoder_ extends Transcoder<infer Native> ? Native : never;

export class Decoder<T = any> {
  constructor(readonly _d: (cursor: Cursor) => T) {}

  decode = (u8a: Uint8Array): T => {
    return this._d(new Cursor(u8a));
  };
}

export class Encoder<T = any> {
  constructor(
    readonly _e: (
      cursor: Cursor,
      value: T,
    ) => void,
    readonly _s: (value: T) => number,
  ) {}

  encode = (decoded: T): Uint8Array => {
    const cursor = new Cursor(new Uint8Array(this._s(decoded)));
    this._e(cursor, decoded);
    return cursor.u8a;
  };
}

export const enum ByteLen {
  _1 = 1,
  _2 = 1 << 1,
  _4 = 1 << 2,
  _8 = 1 << 3,
  _16 = 1 << 4,
}
