import { Codec, createCodec, Expand, Narrow, Native, U2I } from "../common.ts";

export type Field<K extends keyof any = keyof any, V = any> = [key: K, value: Codec<V>];

export type NativeField<F extends Field> = { [_ in F[0]]: Native<F[1]> };

// // TODO: do we prefer the following (variadic) approach?
export type NativeObject<O extends Field[]> = Expand<
  U2I<
    | {}
    | {
      [K in keyof O]: O[K] extends Field<infer K, infer V> ? Record<K, V> : never;
    }[number]
  >
>;

export function object<O extends Field[]>(...fields: Narrow<O>): Codec<NativeObject<O>>;
export function object<O extends Field[]>(...fields: O): Codec<NativeObject<O>> {
  return createCodec({
    name: "object",
    _metadata: [object, ...fields] as any,
    _staticSize: fields.map((x) => x[1]._staticSize).reduce((a, b) => a + b, 0),
    _encode(buffer, value) {
      fields.forEach(([key, fieldEncoder]) => {
        fieldEncoder._encode(buffer, (value as any)[key]);
      });
    },
    _decode(buffer) {
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < fields.length; i++) {
        const [key, field] = fields[i]!;
        obj[key as any] = field._decode(buffer);
      }
      return obj as any;
    },
  });
}
