import { Decoder, Encoder } from "/common.ts";
import { LiteralDecoder, LiteralEncoder } from "/literal.ts";
import { RecordDecoder, RecordEncoder, RecordFieldDecoder, RecordFieldEncoder } from "/record.ts";
import { UnionDecoder, UnionEncoder } from "/union.ts";

export const Tag = Symbol.for("scale.Tag");
export type Tag = typeof Tag;

export class TaggedUnionMemberDecoder<
  MemberTag extends PropertyKey = PropertyKey,
  FieldDecoders extends RecordFieldDecoder[] = RecordFieldDecoder[],
> extends RecordDecoder<[RecordFieldDecoder<Tag, Decoder<MemberTag>>, ...FieldDecoders]> {
  constructor(
    memberTag: MemberTag,
    ...fieldDecoders: FieldDecoders
  ) {
    super(
      new RecordFieldDecoder(Tag, LiteralDecoder(memberTag)),
      ...fieldDecoders,
    );
  }
}

export class TaggedUnionDecoder<MemberDecoders extends TaggedUnionMemberDecoder[]>
  extends UnionDecoder<MemberDecoders>
{
  constructor(...memberDecoders: MemberDecoders) {
    super(...memberDecoders);
  }
}

export class TaggedUnionMemberEncoder<
  MemberTag extends PropertyKey = PropertyKey,
  FieldEncoders extends RecordFieldEncoder[] = RecordFieldEncoder[],
> extends RecordEncoder<[RecordFieldEncoder<Tag, Encoder<MemberTag>>, ...FieldEncoders]> {
  constructor(
    readonly memberTag: MemberTag,
    ...fieldEncoders: FieldEncoders
  ) {
    super(LiteralEncoder(), ...fieldEncoders);
  }
}

export class TaggedUnionEncoder<MemberEncoders extends TaggedUnionMemberEncoder[] = TaggedUnionMemberEncoder[]>
  extends UnionEncoder<MemberEncoders>
{
  constructor(...memberEncoders: MemberEncoders) {
    super(
      (value) => {
        return memberEncoders.findIndex((memberEncoder) => memberEncoder.memberTag === value[Tag]);
      },
      ...memberEncoders,
    );
  }
}
