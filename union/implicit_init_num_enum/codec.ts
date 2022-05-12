import { Codec, Cursor } from "../../common.ts";
import { u8 } from "../../int/codec.ts";

// TODO: decide whether to pursue further static-type-level safeguards
export class OrderedNumEnumCodec<Enum> extends Codec<Enum[keyof Enum]> {
  constructor(readonly enum_: Enum) {
    super();
  }
  _size() {
    return 1;
  }
  _encode(cursor: Cursor, value: Enum[keyof Enum]) {
    const discriminant = (this.enum_ as any)[(this.enum_ as any)[value]];
    u8._encode(cursor, discriminant);
  }
  _decode(cursor: Cursor) {
    const discriminant = u8._decode(cursor);
    return (this.enum_ as any)[(this.enum_ as any)[discriminant]];
  }
}
export const orderedNumEnum = <Enum>(enum_: Enum): OrderedNumEnumCodec<Enum> => {
  return new OrderedNumEnumCodec(enum_);
};
