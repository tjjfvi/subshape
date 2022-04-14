import { Codec } from "./common.ts";
import { dummy } from "./dummy.ts";
import { Field, NativeRecord, record } from "./record.ts";
import { Union } from "./union.ts";

export type TaggedUnionMember<
  MemberTag extends PropertyKey = PropertyKey,
  MemberEntryKey extends PropertyKey = PropertyKey,
  MemberEntryValueCodec extends Codec = Codec,
> = [MemberTag, ...Field<MemberEntryKey, MemberEntryValueCodec>[]];

export type NativeTaggedUnionMember<M extends TaggedUnionMember> =
  & { _tag: M[0] }
  & (M extends [any, ...infer R] ? R extends Field[] ? NativeRecord<R> : {} : never);

export type NativeTaggedUnionMembers<M extends TaggedUnionMember[]> = M extends [] ? never
  : M extends [infer E0, ...infer ERest] ?
    | (E0 extends TaggedUnionMember ? NativeTaggedUnionMember<E0> : never)
    | (ERest extends TaggedUnionMember[] ? NativeTaggedUnionMembers<ERest> : never)
  : never;
namespace NativeTaggedUnionMembers {
  export type _0<T> = T extends TaggedUnionMember ? NativeTaggedUnionMember<T> : T;
}

export class TaggedUnion<Members extends TaggedUnionMember[]> extends Union<NativeTaggedUnionMembers<Members>[]> {
  constructor(...members: Members) {
    super(
      (value) => {
        return members.findIndex((member) => {
          // TODO: variadic `NativeTaggedUnionMembers` makes presence of `_tag` inaccessible? Investigate.
          return member[0] === (value as any)._tag;
        });
      },
      ...members.map(([memberTag, ...fields]) => {
        return record(["_tag", dummy(memberTag)], ...fields || []);
        // TODO: investigate
      }) as any[],
    );
  }
}

export const taggedUnion = <
  Members extends TaggedUnionMember<MemberTag, MemberEntryKey, MemberEntryValueCodec>[],
  MemberTag extends PropertyKey,
  MemberEntryKey extends PropertyKey,
  MemberEntryValueCodec extends Codec,
>(...members: Members): TaggedUnion<Members> => {
  return new TaggedUnion(...members);
};
