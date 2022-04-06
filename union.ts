import { Codec, Native } from "/common.ts";
import { u8 } from "/int.ts";
import { Literal } from "/literal.ts";
import { Record, RecordField } from "/record.ts";

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

export const Tag = Symbol.for("scale.Tag");
export type Tag = typeof Tag;

export class TaggedUnionMember<
  MemberTag extends PropertyKey = PropertyKey,
  FieldCodecs extends RecordField[] = RecordField[],
> extends Record<[RecordField<Tag, Codec<MemberTag>>, ...FieldCodecs]> {
  constructor(
    readonly memberTag: MemberTag,
    ...fieldCodec: FieldCodecs
  ) {
    super(
      new RecordField(Tag, Literal(memberTag)),
      ...fieldCodec,
    );
  }
}

export class TaggedUnion<MemberCodecs extends TaggedUnionMember[] = TaggedUnionMember[]> extends Union<MemberCodecs> {
  constructor(...memberCodecs: MemberCodecs) {
    super(
      (value) => {
        return memberCodecs.findIndex((memberEncoder) => memberEncoder.memberTag === value[Tag]);
      },
      ...memberCodecs,
    );
  }
}
