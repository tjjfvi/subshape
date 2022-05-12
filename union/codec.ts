import { Codec, CodecList, Cursor, Native } from "../common.ts";
import { u8 } from "../int/codec.ts";

export type NativeUnion<MemberCodecs extends Codec[] = Codec[]> = Native<MemberCodecs[number]>;

export class UnionCodec<Members extends any[]> extends Codec<Members[number]> {
  readonly memberCodecs: Codec<any>[];
  constructor(
    readonly discriminate: (value: Members[number]) => number,
    ...memberCodecs: CodecList<Members>
  ) {
    super();
    this.memberCodecs = memberCodecs;
  }
  _size(value: Members[number]) {
    return 1 + this.memberCodecs[this.discriminate(value)]!._size(value);
  }
  _encode(cursor: Cursor, value: Members[number]) {
    const discriminant = this.discriminate(value);
    u8._encode(cursor, discriminant);
    const memberEncoder = this.memberCodecs[discriminant]!;
    memberEncoder._encode(cursor, value);
  }
  _decode(cursor: Cursor) {
    const discriminant = u8._decode(cursor);
    const memberCodec = this.memberCodecs[discriminant];
    if (!memberCodec) {
      throw new Error(`No such member codec matching the discriminant \`${discriminant}\``);
    }
    return memberCodec._decode(cursor);
  }
}
export const union = <Members extends any[]>(
  discriminate: (value: Members[number]) => number,
  ...memberCodecs: CodecList<Members>
): UnionCodec<Members> => {
  return new UnionCodec(discriminate, ...memberCodecs);
};
