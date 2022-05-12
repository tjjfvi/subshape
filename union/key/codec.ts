import { Codec } from "../../common.ts";
import { u8 } from "../../int/codec.ts";

export class KeyLiteralUnionCodec<Member extends PropertyKey> extends Codec<Member> {
  constructor(...members: Member[]) {
    const discriminantByKey = members.reduce<Partial<Record<Member, number>>>((acc, cur, i) => {
      return {
        ...acc,
        [cur]: i,
      };
    }, {}) as Partial<Record<Member, number>>;
    super(
      () => {
        return u8._s(undefined as any);
      },
      (cursor, value) => {
        const discriminant = discriminantByKey[value]!;
        u8._e(cursor, discriminant);
      },
      (cursor) => {
        const discriminant = u8._d(cursor);
        return members[discriminant]!;
      },
    );
  }
}
export const keyLiteralUnion = <Member extends PropertyKey>(...members: Member[]): KeyLiteralUnionCodec<Member> => {
  return new KeyLiteralUnionCodec(...members);
};
