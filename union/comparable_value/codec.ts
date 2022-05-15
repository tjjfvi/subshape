import { Codec } from "../../common.ts";
import { union } from "../codec.ts";

export function comparableValueUnion<
  MemberWide,
  Member extends MemberWide,
>(
  memberCodec: Codec<MemberWide>,
  ...members: Member[]
) {
  return union<Codec<Member>[]>(
    (value) => {
      return members.findIndex((member) => member === value);
    },
    ...new Array(members.length).fill(memberCodec),
  );
}
