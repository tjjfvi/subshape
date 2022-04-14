import { Codec, Native } from "./common.ts";
import { dummy } from "./dummy.ts";
import { u8 } from "./int.ts";
import { Field, NativeRecord, record } from "./record.ts";

export type NativeUnion<MemberCodecs extends Codec[] = Codec[]> = Native<MemberCodecs[number]>;

type CodecList<T extends any[]> = {
  [Key in keyof T]: CodecList._0<Key, T[Key]>;
};
namespace CodecList {
  export type _0<Key extends PropertyKey, Value> = Key extends `${number}` ? Codec<Value> : Value;
}

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
