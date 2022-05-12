import { Codec } from "../../common.ts";
import { u8 } from "../../int/codec.ts";

// TODO: decide whether to pursue further static-type-level safeguards
export class OrderedNumEnumCodec<Enum> extends Codec<Enum[keyof Enum]> {
  constructor(enum_: Enum) {
    super(
      () => {
        return 1;
      },
      (cursor, value) => {
        const discriminant = (enum_ as any)[(enum_ as any)[value]];
        u8._e(cursor, discriminant);
      },
      (cursor) => {
        const discriminant = u8._d(cursor);
        return (enum_ as any)[(enum_ as any)[discriminant]];
      },
    );
  }
}
export const orderedNumEnum = <Enum>(enum_: Enum): OrderedNumEnumCodec<Enum> => {
  return new OrderedNumEnumCodec(enum_);
};
