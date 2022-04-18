import { Codec, Flatten } from "../../common.ts";
import { dummy } from "../../dummy/codec.ts";
import { Field, NativeRecord, record } from "../../record/codec.ts";
import { Union } from "../../union/codec.ts";

export type TaggedUnionMember<
  MemberTag extends PropertyKey = PropertyKey,
  MemberEntryKey extends PropertyKey = PropertyKey,
  MemberEntryValueCodec extends Codec = Codec,
> = [MemberTag, ...Field<MemberEntryKey, MemberEntryValueCodec>[]];

export type NativeTaggedUnionMember<
  TagKey extends PropertyKey,
  M extends TaggedUnionMember,
> =
  & { [_ in TagKey]: M[0] }
  & (M extends [any, ...infer R] ? R extends Field[] ? NativeRecord<R> : {} : never);

export type NativeTaggedUnionMembers<
  TagKey extends PropertyKey,
  M extends TaggedUnionMember[],
> = M extends [] ? never
  : M extends [infer E0, ...infer ERest] ?
    | (E0 extends TaggedUnionMember ? NativeTaggedUnionMember<TagKey, E0> : never)
    | (ERest extends TaggedUnionMember[] ? NativeTaggedUnionMembers<TagKey, ERest> : never)
  : never;

export class TaggedUnion<
  TagKey extends PropertyKey,
  Members extends TaggedUnionMember[],
> extends Union<Flatten<NativeTaggedUnionMembers<TagKey, Members>>[]> {
  constructor(
    tagKey: TagKey,
    ...members: Members
  ) {
    super(
      (value) => {
        return members.findIndex((member) => {
          return member[0] === value[tagKey];
        });
      },
      ...members.map(([memberTag, ...fields]) => {
        return record(["_tag", dummy(memberTag)], ...fields || []) as NativeTaggedUnionMembers<TagKey, Members>;
      }),
    );
  }
}

export const taggedUnion = <
  TagKey extends PropertyKey,
  Members extends TaggedUnionMember<MemberTag, MemberEntryKey, MemberEntryValueCodec>[],
  MemberTag extends PropertyKey,
  MemberEntryKey extends PropertyKey,
  MemberEntryValueCodec extends Codec,
>(
  tagKey: TagKey,
  ...members: Members
): TaggedUnion<TagKey, Members> => {
  return new TaggedUnion(tagKey, ...members);
};
