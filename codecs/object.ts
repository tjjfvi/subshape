import { AnyCodec, Codec, createCodec, Expand, metadata, Native, U2I } from "../common/mod.ts"
import { option } from "./option.ts"

export function field<K extends keyof any, V>(key: K, $value: Codec<V>): Codec<Expand<Record<K, V>>> {
  return createCodec({
    _metadata: metadata("$.field", field, key, $value),
    _staticSize: $value._staticSize,
    _encode(buffer, value) {
      $value._encode(buffer, value[key])
    },
    _decode(buffer) {
      return { [key]: $value._decode(buffer) } as any
    },
    _assert(assert) {
      $value._assert(assert.key(this, key))
    },
  })
}

export function optionalField<K extends keyof any, V>(key: K, $value: Codec<V>): Codec<Expand<Partial<Record<K, V>>>> {
  const $option = option($value)
  return createCodec({
    _metadata: metadata("$.optionalField", optionalField, key, $value),
    _staticSize: $value._staticSize,
    _encode(buffer, value) {
      $option._encode(buffer, value[key])
    },
    _decode(buffer) {
      if (buffer.array[buffer.index++]) {
        return { [key]: $value._decode(buffer) } as any
      } else {
        return {}
      }
    },
    _assert(assert) {
      assert.typeof(this, "object")
      assert.nonNull(this)
      if (key in (assert.value as any)) {
        $option._assert(assert.key(this, key))
      }
    },
  })
}

export type NativeObject<T extends AnyCodec[]> = Expand<
  U2I<
    | { x: {} }
    | {
      [K in keyof T]: { x: Native<T[K]> }
    }[number]
  >["x"]
>

type UnionKeys<T> = T extends T ? keyof T : never
export type ObjectMembers<T extends AnyCodec[]> = [
  ...never extends T ? {
      [K in keyof T]:
        & UnionKeys<Native<T[K]>>
        & {
          [L in keyof T]: K extends L ? never : UnionKeys<Native<T[L]>>
        }[number] extends (infer O extends keyof any)
        ? [O] extends [never] ? Codec<Native<T[K]> & {}> : Codec<{ [_ in O]?: never }>
        : never
    }
    : T,
]

export function object<T extends AnyCodec[]>(...members: ObjectMembers<T>): Codec<NativeObject<T>> {
  return createCodec({
    _metadata: metadata("$.object", object<T>, ...members),
    _staticSize: members.map((x) => x._staticSize).reduce((a, b) => a + b, 0),
    _encode(buffer, value) {
      for (const member of members as T) {
        member._encode(buffer, value as never)
      }
    },
    _decode(buffer) {
      let value = {}
      for (const member of members as T) {
        value = { ...value, ...member._decode(buffer) }
      }
      return value as any
    },
    _assert(assert) {
      assert.typeof(this, "object")
      assert.nonNull(this)
      for (const member of members as T) {
        member._assert(assert)
      }
    },
  })
}
