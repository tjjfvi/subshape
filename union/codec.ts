import { Codec, CodecList, Native } from "../common.ts";
import { u8 } from "../int/codec.ts";

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
        const memberCodec = memberCodecs[discriminant];
        if (!memberCodec) {
          throw new Error(`No such member codec matching the discriminant \`${discriminant}\``);
        }
        return memberCodec._d(cursor);
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
