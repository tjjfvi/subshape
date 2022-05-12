import { Codec, Cursor } from "../../common.ts";
import { u8 } from "../../int/codec.ts";

export class KeyLiteralUnionCodec<Member extends PropertyKey> extends Codec<Member> {
  readonly members;
  readonly discriminantByKey;
  constructor(...members: Member[]) {
    super();
    this.members = members;
    this.discriminantByKey = members.reduce<Partial<Record<Member, number>>>((acc, cur, i) => {
      return {
        ...acc,
        [cur]: i,
      };
    }, {}) as Partial<Record<Member, number>>;
  }
  _size() {
    return u8._size();
  }
  _encode(cursor: Cursor, value: Member) {
    const discriminant = this.discriminantByKey[value]!;
    u8._encode(cursor, discriminant);
  }
  _decode(cursor: Cursor) {
    const discriminant = u8._decode(cursor);
    return this.members[discriminant]!;
  }
}
export const keyLiteralUnion = <Member extends PropertyKey>(...members: Member[]): KeyLiteralUnionCodec<Member> => {
  return new KeyLiteralUnionCodec(...members);
};
