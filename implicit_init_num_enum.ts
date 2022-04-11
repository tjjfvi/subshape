import { Codec } from "./common.ts";
import { u8 } from "./int.ts";

type NativeEnum<Key extends string = string> =
  & {
    [_ in Key]: number;
  }
  & {
    [K in Key as number]: K;
  };

export class OrderedNumEnum<Enum = NativeEnum> extends Codec<Enum[keyof Enum]> {
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
export const orderedNumEnum = <NativeEnum>(nativeEnum: NativeEnum): OrderedNumEnum<NativeEnum> => {
  return new OrderedNumEnum(nativeEnum);
};
