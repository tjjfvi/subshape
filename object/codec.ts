import { Codec, createCodec, Expand, Native, U2I } from "../common.ts";

export type Field<
  Key extends PropertyKey = PropertyKey,
  ValueCodec extends Codec<any> = Codec<any>,
> = [Key, ValueCodec];

export type NativeField<F extends Field> = { [_ in F[0]]: Native<F[1]> };

// // TODO: do we prefer the following (variadic) approach?
export type NativeObject<Fields extends Field[]> = Expand<
  U2I<
    | {}
    | {
      [K in keyof Fields]: Fields[K] extends Field<infer K, infer V> ? { [_ in K]: Native<V> } : never;
    }[number]
  >
>;

export function object<
  Fields extends Field<EntryKey, EntryValueCodec>[],
  EntryKey extends PropertyKey,
  EntryValueCodec extends Codec<any>,
>(...fields: Fields) {
  return createCodec<NativeObject<Fields>>({
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
