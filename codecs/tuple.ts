import { AnyCodec, Codec, createCodec, Input, metadata, Output } from "../common/mod.ts"

export type InputTuple<T extends AnyCodec[]> = {
  readonly [K in keyof T]: Input<T[K]>
}
export type OutputTuple<T extends AnyCodec[]> = {
  [K in keyof T]: Output<T[K]>
}

export function tuple<T extends AnyCodec[]>(...codecs: [...T]): Codec<InputTuple<T>, OutputTuple<T>> {
  return createCodec({
    _metadata: metadata("$.tuple", tuple<T>, ...codecs),
    _staticSize: codecs.map((x) => x._staticSize).reduce((a, b) => a + b, 0),
    _encode(buffer, value) {
      for (let i = 0; i < codecs.length; i++) {
        codecs[i]._encode(buffer, value[i] as never)
      }
    },
    _decode(buffer) {
      const value = Array(codecs.length)
      for (let i = 0; i < codecs.length; i++) {
        value[i] = codecs[i]._decode(buffer)
      }
      return value as any
    },
    _assert(assert) {
      assert.instanceof(this, Array)
      assert.key(this, "length").equals(this, codecs.length)
      for (let i = 0; i < codecs.length; i++) {
        codecs[i]._assert(assert.key(this, i))
      }
    },
  })
}
