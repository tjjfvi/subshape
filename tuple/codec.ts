import { Codec, createCodec } from "../common.ts";

export type NativeTuple<ElCodecs extends Codec<any>[]> = {
  [I in keyof ElCodecs]: ElCodecs[I] extends Codec<infer T> ? T : never;
};

export function tuple<T extends Codec<any>[]>(...codecs: [...T]): Codec<NativeTuple<T>> {
  return createCodec<NativeTuple<T>, [...T]>({
    name: "tuple",
    _metadata: [tuple, ...codecs],
    _staticSize: codecs.map((x) => x._staticSize).reduce((a, b) => a + b, 0),
    _encode(buffer, value) {
      for (let i = 0; i < codecs.length; i++) {
        codecs[i]._encode(buffer, value[i]);
      }
    },
    _decode(buffer) {
      const value = Array(codecs.length);
      for (let i = 0; i < codecs.length; i++) {
        value[i] = codecs[i]._decode(buffer);
      }
      return value as any;
    },
  });
}
