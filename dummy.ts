import { Codec, Native } from "/common.ts";

export const Dummy = <E extends Codec>(value: Native<E>): E => {
  return new Codec(
    (_value) => {
      return 0;
    },
    (_cursor) => {},
    (_cursor) => {
      return value;
    },
  ) as any;
};
