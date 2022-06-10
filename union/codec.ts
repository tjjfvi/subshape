import { Codec, createCodec, Native } from "../common.ts";

export type NativeUnion<MemberCodecs extends Codec<any>[]> = Native<MemberCodecs[number]>;

export function union<Members extends Codec<any>[]>(
  discriminate: (value: NativeUnion<Members>) => number,
  ...$members: [...Members]
): Codec<NativeUnion<Members>> {
  return createCodec({
    _metadata: [union, discriminate, ...$members],
    _staticSize: 1 + Math.max(...$members.map((x) => x._staticSize)),
    _encode(buffer, value) {
      const discriminant = discriminate(value);
      buffer.array[buffer.index++] = discriminant;
      const $member = $members[discriminant]!;
      $member._encode(buffer, value);
    },
    _decode(buffer) {
      const discriminant = buffer.array[buffer.index++]!;
      const $member = $members[discriminant];
      if (!$member) {
        throw new Error(`No such member codec matching the discriminant \`${discriminant}\``);
      }
      return $member._decode(buffer);
    },
  });
}
