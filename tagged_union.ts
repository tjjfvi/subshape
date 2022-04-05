import { Encoder, Native, Transcoder } from "/common.ts";
import { LiteralDecoder } from "/literal.ts";
import {
  NativeRecord,
  NativeRecordField,
  RecordDecoder,
  RecordEncoder,
  RecordFieldDecoder,
  RecordFieldEncoder,
} from "/record.ts";
import { NativeUnion, UnionDecoder, UnionEncoder } from "/union.ts";

export const Tag = Symbol.for("scale.Tag");
export type Tag = typeof Tag;

export type NativeTaggedUnionMember<
  MemberTag extends PropertyKey = PropertyKey,
  MemberFields extends Transcoder<NativeRecordField>[] = Transcoder<NativeRecordField>[],
> = { [Tag]: MemberTag } & NativeRecord<MemberFields>;

// type NativeTaggedUnion

// export class TaggedUnionDecoder<
//   MemberTag extends PropertyKey,
//   MemberDecoders extends RecordDecoder[],
// > extends UnionDecoder<[RecordFieldDecoder<Tag, LiteralDecoder<MemberTag>>, ...MemberDecoders]> {
//   constructor(
//     memberTag: MemberTag,
//     ...memberDecoders: MemberDecoders
//   ) {
//     super(
//       new RecordFieldDecoder(Tag, new LiteralDecoder(memberTag)),
//       ...memberDecoders,
//     );
//   }
// }

// export class TaggedUnionEncoder<
//   MemberTag extends PropertyKey,
//   MemberEncoders extends Encoder[],
// > extends UnionEncoder<Native<Encoder<[RecordFieldEncoder<Tag, Encoder<"A">>, ...MemberEncoders]>>> {
//   constructor(...memberEncoders: MemberEncoders) {
//     super(
//       (value) => {},
//       ...memberEncoders,
//     );
//   }
// }
