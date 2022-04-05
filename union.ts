import { Decoder, Encoder, Native, Transcoder } from "/common.ts";
import { u8Decoder, u8Encoder } from "/int.ts";
import { RecordDecoder } from "/record.ts";

export const Tag = Symbol.for("scale.Tag");
export type Tag = typeof Tag;

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
