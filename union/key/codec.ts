import { createCodec } from "../../common.ts";

export function keyLiteralUnion<Member extends PropertyKey>(...members: Member[]) {
  const discriminantByKey = members.reduce<Partial<Record<Member, number>>>((acc, cur, i) => {
    return {
      ...acc,
      [cur]: i,
    };
  }, {}) as Partial<Record<Member, number>>;
  return createCodec<Member>({
    _staticSize: 1,
    _encode(buffer, value) {
      const discriminant = discriminantByKey[value]!;
      buffer.array[buffer.index++] = discriminant;
    },
    _decode(buffer) {
      const discriminant = buffer.array[buffer.index++]!;
      return members[discriminant]!;
    },
  });
}
