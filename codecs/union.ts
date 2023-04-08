import { AnyCodec, Input, Output } from "../common/codec.ts"
import { Codec, createCodec, Expand, metadata, Narrow, ScaleAssertError, ScaleDecodeError } from "../common/mod.ts"
import { constant } from "./constant.ts"
import { field, InputObject, object, ObjectMembers, OutputObject } from "./object.ts"

export class Variant<T extends string, I, O> {
  constructor(readonly tag: T, readonly codec: Codec<I, O>) {}
}

export function variant<T extends string, E extends AnyCodec[]>(
  tag: T,
  ...members: ObjectMembers<E>
): Variant<T, InputObject<E>, OutputObject<E>> {
  return new Variant(tag, object(...members))
}

export type InputTaggedUnion<
  K extends keyof any,
  M extends Record<number, Variant<any, any, any>>,
> = {
  [I in keyof M]: Expand<
    & Readonly<Record<K, Extract<M[I], Variant<any, any, any>>["tag"]>>
    & Input<Extract<M[I], Variant<any, any, any>>["codec"]>
  >
}[keyof M & number]
export type OutputTaggedUnion<
  K extends keyof any,
  M extends Record<number, Variant<any, any, any>>,
> = {
  [I in keyof M]: Expand<
    & Record<K, Extract<M[I], Variant<any, any, any>>["tag"]>
    & Output<Extract<M[I], Variant<any, any, any>>["codec"]>
  >
}[keyof M & number]

export function taggedUnion<
  K extends keyof any,
  M extends [] | Record<number, Variant<any, any, any>>,
>(tagKey: K, members: M): Codec<InputTaggedUnion<K, M>, OutputTaggedUnion<K, M>> {
  const tagToDiscriminant: Record<string, number> = Object.create(null)
  const discriminantToMember: Record<number, Codec<any>> = Object.create(null)
  for (const _discriminant in members) {
    const discriminant = +_discriminant
    if (isNaN(discriminant)) continue
    const { tag, codec } = (members as M)[discriminant]!
    tagToDiscriminant[tag] = discriminant
    discriminantToMember[discriminant] = object(field(tagKey, constant(tag)) as any, codec)
  }
  return createCodec({
    _metadata: metadata("$.taggedUnion", taggedUnion, tagKey, members),
    _staticSize: 1 + Math.max(...Object.values(discriminantToMember).map((x) => x._staticSize)),
    _encode(buffer, value) {
      const discriminant = tagToDiscriminant[value[tagKey]]!
      const $member = discriminantToMember[discriminant]!
      buffer.array[buffer.index++] = discriminant
      $member._encode(buffer, value as never)
    },
    _decode(buffer) {
      const discriminant = buffer.array[buffer.index++]!
      const $member = discriminantToMember[discriminant]
      if (!$member) {
        throw new ScaleDecodeError(this, buffer, `No such member codec matching the discriminant \`${discriminant}\``)
      }
      return $member._decode(buffer)
    },
    _assert(assert) {
      const assertTag = assert.key(this, tagKey)
      assertTag.typeof(this, "string")
      if (!((assertTag.value as string) in tagToDiscriminant)) {
        throw new ScaleAssertError(this, assertTag.value, `${assertTag.path}: invalid tag`)
      }
      discriminantToMember[tagToDiscriminant[assertTag.value as string]!]!._assert(assert)
    },
  })
}

export function literalUnion<T extends Narrow>(members: Record<number, T>): Codec<T> {
  const keyToDiscriminant: Map<T, number> = new Map()
  for (const _discriminant in members) {
    const discriminant = +_discriminant
    if (isNaN(discriminant)) continue
    const key = members[discriminant] as T
    keyToDiscriminant.set(key, discriminant)
  }
  return createCodec({
    _metadata: metadata("$.literalUnion", literalUnion, members),
    _staticSize: 1,
    _encode(buffer, value) {
      const discriminant = keyToDiscriminant.get(value)!
      buffer.array[buffer.index++] = discriminant
    },
    _decode(buffer) {
      const discriminant = buffer.array[buffer.index++]!
      return members[discriminant]!
    },
    _assert(assert) {
      assert.typeof(this, "string")
      if (!keyToDiscriminant.has(assert.value as T)) {
        throw new ScaleAssertError(this, assert.value, `${assert.path} invalid value`)
      }
    },
  })
}
