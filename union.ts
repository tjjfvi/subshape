import { Decoder, Encoder, Native, Transcoder } from "/common.ts";
import { u8Decoder, u8Encoder } from "/int.ts";
import { LiteralDecoder, LiteralEncoder } from "/literal.ts";
import { RecordDecoder, RecordEncoder, RecordFieldDecoder, RecordFieldEncoder } from "/record.ts";

export type NativeUnion<Members extends Transcoder[] = Transcoder[]> = Native<Members[number]>;

/** Decode a union */
export class UnionDecoder<MemberDecoders extends RecordDecoder[]> extends Decoder<NativeUnion<MemberDecoders>> {
  /**
   * @param memberDecoders The ordered member decoders
   */
  constructor(...memberDecoders: MemberDecoders) {
    super((cursor) => {
      const discriminant = u8Decoder._d(cursor);
      // TODO: ensure this is the correct type-level behavior
      return memberDecoders[discriminant]!._d(cursor) as NativeUnion<MemberDecoders>;
    });
  }
}

/** Encode a union */
export class UnionEncoder<MemberEncoders extends Encoder[]> extends Encoder<NativeUnion<MemberEncoders>> {
  /**
   * @param discriminate A function which accepts the decoded value and returns the encoder with which to encode the value
   */
  constructor(
    readonly discriminate: (value: NativeUnion<MemberEncoders>) => number,
    ...memberEncoders: MemberEncoders
  ) {
    super(
      (cursor, value) => {
        const discriminant = discriminate(value);
        u8Encoder._e(cursor, discriminant);
        const memberEncoder = memberEncoders[discriminant]!;
        memberEncoder._e(cursor, value);
      },
      (value) => {
        return 1 + memberEncoders[discriminate(value)]!._s(value);
      },
    );
  }
}

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
