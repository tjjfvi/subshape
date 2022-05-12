import { Codec, Flatten, Native } from "../common.ts";

export type Field<
  Key extends PropertyKey = PropertyKey,
  ValueCodec extends Codec = Codec,
> = [Key, ValueCodec];

export type NativeField<F extends Field> = { [_ in F[0]]: Native<F[1]> };

// // TODO: do we prefer the following (variadic) approach?
export type NativeRecord<Fields extends Field[]> = Fields extends [] ? {}
  : Fields extends [Field<infer K, infer V>, ...infer Rest]
    ? { [_ in K]: Native<V> } & (Rest extends Field[] ? NativeRecord<Rest> : {})
  : never;

export class RecordCodec<Fields extends Field[]> extends Codec<Flatten<NativeRecord<Fields>>> {
  constructor(...fields: Fields) {
    super(
      (value) => {
        return fields.reduce<number>((len, [key, fieldEncoder]) => {
          return len + fieldEncoder._s((value as any)[key]);
        }, 0);
      },
      (cursor, value) => {
        fields.forEach(([key, fieldEncoder]) => {
          fieldEncoder._e(cursor, (value as any)[key]);
        });
      },
      (cursor) => {
        return fields.reduce<Partial<Flatten<NativeRecord<Fields>>>>((acc, [key, fieldCodec]) => {
          return {
            ...acc,
            [key]: fieldCodec._d(cursor),
          };
        }, {}) as Flatten<NativeRecord<Fields>>;
      },
    );
  }
}
export const record = <
  Fields extends Field<EntryKey, EntryValueCodec>[],
  EntryKey extends PropertyKey,
  EntryValueCodec extends Codec,
>(...fields: Fields): RecordCodec<Fields> => {
  return new RecordCodec(...fields);
};
