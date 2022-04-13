import { Codec, Native } from "./common.ts";
import { dummy } from "./dummy.ts";
import { u8 } from "./int.ts";
import { Field, NativeRecord, record } from "./record.ts";

export type NativeUnion<MemberCodecs extends Codec[] = Codec[]> = Native<MemberCodecs[number]>;

export class Union<MemberCodecs extends Codec[]> extends Codec<NativeUnion<MemberCodecs>> {
  constructor(
    readonly discriminate: (value: NativeUnion<MemberCodecs>) => number,
    ...memberCodecs: MemberCodecs
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
        // TODO: ensure this is the correct type-level behavior
        return memberCodecs[discriminant]!._d(cursor) as NativeUnion<MemberCodecs>;
      },
    );
  }
}
export const union = <MemberCodecs extends Codec[]>(
  discriminate: (value: NativeUnion<MemberCodecs>) => number,
  ...memberCodecs: MemberCodecs
): Union<MemberCodecs> => {
  return new Union(discriminate, ...memberCodecs);
};

export type TaggedUnionMember<
  MemberTag extends PropertyKey = PropertyKey,
  MemberEntryKey extends PropertyKey = PropertyKey,
  MemberEntryValueCodec extends Codec = Codec,
> = [memberTag: MemberTag, fields?: Field<MemberEntryKey, MemberEntryValueCodec>[]];
export type NativeTaggedUnionMember<M extends TaggedUnionMember> =
  & { _tag: M[0] }
  & (M[1] extends Field[] ? NativeRecord<M[1]> : {});

export class TaggedUnion<
  Members extends TaggedUnionMember<MemberTag, MemberEntryKey, MemberEntryValueCodec>[],
  MemberTag extends PropertyKey,
  MemberEntryKey extends PropertyKey,
  MemberEntryValueCodec extends Codec,
> extends Union<Codec<NativeTaggedUnionMember<Members[number]>>[]> {
  constructor(...members: Members) {
    super(
      (value) => {
        return members.findIndex((member) => {
          return member[0] === value._tag;
        });
      },
      ...members.map(([memberTag, fields]) => {
        return record(["_tag", dummy(memberTag)], ...fields || []);
      }) as any[],
    );
  }
}
export const taggedUnion = <
  Members extends TaggedUnionMember<MemberTag, MemberEntryKey, MemberEntryValueCodec>[],
  MemberTag extends PropertyKey,
  MemberEntryKey extends PropertyKey,
  MemberEntryValueCodec extends Codec,
>(...members: Members): TaggedUnion<Members, MemberTag, MemberEntryKey, MemberEntryValueCodec> => {
  return new TaggedUnion(...members);
};

export class ComparableValueUnion<
  MemberCodec extends Codec,
  Member extends Native<MemberCodec>,
> extends Union<Codec<Member>[]> {
  constructor(
    memberCodec: MemberCodec,
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
  MemberCodec extends Codec,
  Member extends Native<MemberCodec>,
>(
  memberCodec: MemberCodec,
  ...members: Member[]
): ComparableValueUnion<MemberCodec, Member> => {
  return new ComparableValueUnion(memberCodec, ...members);
};
