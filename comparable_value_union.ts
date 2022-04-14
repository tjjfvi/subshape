import { Codec, CodecList } from "./common.ts";
import { Union } from "./union.ts";

export class ComparableValueUnion<
  MemberCodec extends Codec,
  Members extends any[],
> extends Union<Members> {
  constructor(
    memberCodec: MemberCodec,
    ...members: Members
  ) {
    super(
      (value) => {
        return members.findIndex((member) => member === value);
      },
      ...new Array(members.length).fill(memberCodec) as CodecList<Members>,
    );
  }
}
export const comparableValueUnion = <
  MemberCodec extends Codec,
  Members extends any[],
>(
  memberCodec: MemberCodec,
  ...members: Members
): ComparableValueUnion<MemberCodec, Members> => {
  return new ComparableValueUnion(memberCodec, ...members);
};
