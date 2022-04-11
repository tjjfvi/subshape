import { Codec } from "./common.ts";
import { u8 } from "./int.ts";

export class Enum<NativeEnum> extends Codec<NativeEnum[keyof NativeEnum]> {
  constructor(enum_: NativeEnum) {
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
export const enum_ = <NativeEnum>(nativeEnum: NativeEnum): Enum<NativeEnum> => {
  return new Enum(nativeEnum);
};
