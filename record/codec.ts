import { Codec, Cursor, Flatten, Native } from "../common.ts";

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
  _size(value: Flatten<NativeRecord<Fields>>) {
    return this.fields.reduce<number>((len, [key, fieldEncoder]) => {
      return len + fieldEncoder._size((value as any)[key]);
    }, 0);
  }
  _encode(cursor: Cursor, value: Flatten<NativeRecord<Fields>>) {
    this.fields.forEach(([key, fieldEncoder]) => {
      fieldEncoder._encode(cursor, (value as any)[key]);
    });
  }
  _decode(cursor: Cursor) {
    return this.fields.reduce<Partial<Flatten<NativeRecord<Fields>>>>((acc, [key, fieldCodec]) => {
      return {
        ...acc,
        [key]: fieldCodec._decode(cursor),
      };
    }, {}) as Flatten<NativeRecord<Fields>>;
  }
  readonly fields;
  constructor(...fields: Fields) {
    super();
    this.fields = fields;
  }
}
export const record = <
  Fields extends Field<EntryKey, EntryValueCodec>[],
  EntryKey extends PropertyKey,
  EntryValueCodec extends Codec,
>(...fields: Fields): RecordCodec<Fields> => {
  return new RecordCodec(...fields);
};
