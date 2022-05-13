import { Codec, Cursor } from "../common.ts";
import { u8 } from "../int/codec.ts";

export class OptionCodec<Some> extends Codec<Some | undefined> {
  constructor(readonly someCodec: Codec<Some>) {
    super();
  }
  _minSize = 1;
  _dynSize(value: Some | undefined) {
    return (value === undefined ? 0 : this.someCodec.size(value));
  }
  _encode(cursor: Cursor, value: Some | undefined) {
    cursor.view.setUint8(cursor.i, value === undefined ? 0 : 1);
    cursor.i += 1;
    if (value !== undefined) {
      this.someCodec._encode(cursor, value);
    }
  }
  _decode(cursor: Cursor) {
    switch (u8._decode(cursor)) {
      case 0: {
        return undefined;
      }
      case 1: {
        return this.someCodec._decode(cursor);
      }
      default: {
        throw new Error("Could not decode Option as `Some(_)` nor `None`");
      }
    }
  }
}
export const option = <Some>(someCodec: Codec<Some>): OptionCodec<Some> => {
  return new OptionCodec(someCodec);
};
