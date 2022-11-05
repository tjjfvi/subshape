import { Codec, createCodec, DecodeError, Expand, metadata, Narrow } from "../common/mod.ts";
import { dummy } from "./dummy.ts";
import { AnyField, NativeObject, object } from "./object.ts";

export type AnyTaggedUnionMember = [tag: string, ...fields: AnyField[]];

export type NativeTaggedUnionMember<
  TK extends PropertyKey,
  M extends AnyTaggedUnionMember,
> = Expand<
  & Record<TK, M[0]>
  & (M extends [any, ...infer R] ? R extends AnyField[] ? NativeObject<R> : {} : never)
>;

export type NativeTaggedUnionMembers<
  TK extends PropertyKey,
  M extends Record<number, AnyTaggedUnionMember>,
> = [{ [K in keyof M]: NativeTaggedUnionMember<TK, Extract<M[K], AnyTaggedUnionMember>> }[keyof M & number]][0];

export function taggedUnion<
  TK extends PropertyKey,
  M extends Record<number, AnyTaggedUnionMember>,
>(
  tagKey: TK,
  members: Narrow<M>,
): Codec<NativeTaggedUnionMembers<TK, M>> {
  const tagToDiscriminant: Record<string, number> = {};
  const discriminantToMember: Record<number, Codec<any>> = {};
  for (const _discriminant in members) {
    const discriminant = +_discriminant;
    if (isNaN(discriminant)) continue;
    const [tag, ...fields] = (members as M)[discriminant]!;
    tagToDiscriminant[tag] = discriminant;
    discriminantToMember[discriminant] = object(
      [tagKey, dummy(tag)],
      ...fields,
    );
  }
  return createCodec({
    _metadata: metadata("$.taggedUnion", taggedUnion, tagKey, members),
    _staticSize: 1 + Math.max(...Object.values(discriminantToMember).map((x) => x._staticSize)),
    _encode(buffer, value) {
      const discriminant = tagToDiscriminant[value[tagKey]]!;
      const $member = discriminantToMember[discriminant]!;
      buffer.array[buffer.index++] = discriminant;
      $member._encode(buffer, value as never);
    },
    _decode(buffer) {
      const discriminant = buffer.array[buffer.index++]!;
      const $member = discriminantToMember[discriminant];
      if (!$member) {
        throw new DecodeError(this, buffer, `No such member codec matching the discriminant \`${discriminant}\``);
      }
      return $member._decode(buffer);
    },
  });
}

export function stringUnion<T extends string>(members: Record<number, T>): Codec<T> {
  const keyToDiscriminant: Record<string, number> = {};
  for (const _discriminant in members) {
    const discriminant = +_discriminant;
    if (isNaN(discriminant)) continue;
    const key = members[discriminant]!;
    keyToDiscriminant[key] = discriminant;
  }
  return createCodec({
    _metadata: metadata("$.stringUnion", stringUnion, members),
    _staticSize: 1,
    _encode(buffer, value) {
      const discriminant = keyToDiscriminant[value]!;
      buffer.array[buffer.index++] = discriminant;
    },
    _decode(buffer) {
      const discriminant = buffer.array[buffer.index++]!;
      return members[discriminant]!;
    },
  });
}
