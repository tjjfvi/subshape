import { Codec } from "../../common.ts";
import { Union } from "../../union/codec.ts";

export class ComparableValueUnion<
  MemberWide,
  Member extends MemberWide,
> extends Union<Member[]> {
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
): ComparableValueUnion<MemberWide, Member> => {
  return new ComparableValueUnion(memberCodec, ...members);
};
