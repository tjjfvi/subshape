import { Codec, CodecList, Native } from "./common.ts";
import { u8 } from "./int.ts";

export type NativeUnion<MemberCodecs extends Codec[] = Codec[]> = Native<MemberCodecs[number]>;

export class Union<Members extends any[]> extends Codec<Members[number]> {
  constructor(
    readonly discriminate: (value: Members[number]) => number,
    ...memberCodecs: CodecList<Members>
  ) {
    super(
      (value) => {
        return 1 + memberCodecs[discriminate(value)]!._s(value);
      },
      (cursor, value) => {
        const discriminant = discriminate(value);
        u8._e(cursor, discriminant);
        const memberEncoder = memberCodecs[discriminant]!;
        memberEncoder._e(cursor, value);
      },
      (cursor) => {
        const discriminant = u8._d(cursor);
        return memberCodecs[discriminant]!._d(cursor);
      },
    );
  }
}
export const union = <Members extends any[]>(
  discriminate: (value: Members[number]) => number,
  ...memberCodecs: CodecList<Members>
): Union<Members> => {
  return new Union(discriminate, ...memberCodecs);
};
