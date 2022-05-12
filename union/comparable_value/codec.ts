import { Codec } from "../../common.ts";
import { UnionCodec } from "../../union/codec.ts";

export class ComparableValueUnionCodec<
  MemberWide,
  Member extends MemberWide,
> extends UnionCodec<Member[]> {
  constructor(
    memberCodec: Codec<MemberWide>,
    ...members: Member[]
  ) {
    super(
      (value) => {
        return members.findIndex((member) => member === value);
      },
      ...new Array(members.length).fill(memberCodec),
    );
  }
}
export const comparableValueUnion = <
  MemberWide,
  Member extends MemberWide,
>(
  memberCodec: Codec<MemberWide>,
  ...members: Member[]
): ComparableValueUnionCodec<MemberWide, Member> => {
  return new ComparableValueUnionCodec(memberCodec, ...members);
};
