import { Codec } from "../../common.ts";
import { dummy } from "../../dummy/codec.ts";
import { Field, NativeObject, object } from "../../object/codec.ts";
import { union } from "../../union/codec.ts";

export type TaggedUnionMember<
  MemberTag extends PropertyKey = PropertyKey,
  MemberEntryKey extends PropertyKey = PropertyKey,
  MemberEntryValueCodec extends Codec<any> = Codec<any>,
> = [MemberTag, ...Field<MemberEntryKey, MemberEntryValueCodec>[]];

export type NativeTaggedUnionMember<
  TagKey extends PropertyKey,
  M extends TaggedUnionMember,
> =
  & { [_ in TagKey]: M[0] }
  & (M extends [any, ...infer R] ? R extends Field[] ? NativeObject<R> : {} : never);

export type NativeTaggedUnionMembers<
  TagKey extends PropertyKey,
  M extends TaggedUnionMember[],
> = M extends [] ? never
  : M extends [infer E0, ...infer ERest] ? 
    | (E0 extends TaggedUnionMember ? NativeTaggedUnionMember<TagKey, E0> : never)
    | (ERest extends TaggedUnionMember[] ? NativeTaggedUnionMembers<TagKey, ERest> : never)
  : never;

export function taggedUnion<
  TagKey extends PropertyKey,
  Members extends TaggedUnionMember<MemberTag, MemberEntryKey, MemberEntryValueCodec>[],
  MemberTag extends PropertyKey,
  MemberEntryKey extends PropertyKey,
  MemberEntryValueCodec extends Codec<any>,
>(
  tagKey: TagKey,
  ...members: Members
) {
  return Object.assign(
    union<Codec<NativeTaggedUnionMembers<TagKey, Members>>[]>(
      (value) => {
        return members.findIndex((member) => {
          return member[0] === value[tagKey];
        });
      },
      ...members.map(([memberTag, ...fields]) => {
        return object(
          [tagKey, dummy(memberTag)],
          ...fields || [],
        ) as NativeTaggedUnionMembers<TagKey, Members>;
      }),
    ),
    {
      metadata: [taggedUnion, tagKey, ...members],
    },
  );
}
