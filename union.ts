import { Codec, Native } from "./common.ts";
import { dummy } from "./dummy.ts";
import { u8 } from "./int.ts";
import { Field, Record } from "./record.ts";

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

export class TaggedUnionMember<
  MemberTag extends PropertyKey = PropertyKey,
  FieldCodecs extends Field[] = Field[],
> extends Record<[Field<"_tag", Codec<MemberTag>>, ...FieldCodecs]> {
  constructor(
    readonly memberTag: MemberTag,
    ...fieldCodec: FieldCodecs
  ) {
    super(
      new Field("_tag", dummy(memberTag)),
      ...fieldCodec,
    );
  }
}

export const taggedUnionMember = <
  MemberTag extends PropertyKey = PropertyKey,
  FieldCodecs extends Field[] = Field[],
>(
  memberTag: MemberTag,
  ...fieldCodecs: FieldCodecs
): TaggedUnionMember<MemberTag, FieldCodecs> => {
  return new TaggedUnionMember(memberTag, ...fieldCodecs);
};

// TODO: get rid of contravariant incompatibility without typing member constraint tags as `any`
export class TaggedUnion<MemberCodecs extends TaggedUnionMember<any>[] = TaggedUnionMember<any>[]>
  extends Union<MemberCodecs>
{
  constructor(...memberCodecs: MemberCodecs) {
    super(
      (value) => {
        return memberCodecs.findIndex((memberEncoder) => memberEncoder.memberTag === value._tag);
      },
      ...memberCodecs,
    );
  }
}
// TODO: same thing here
export const taggedUnion = <MemberCodecs extends TaggedUnionMember<any>[]>(
  ...memberCodecs: MemberCodecs
): TaggedUnion<MemberCodecs> => {
  return new TaggedUnion(...memberCodecs);
};
