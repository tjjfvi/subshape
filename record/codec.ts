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
  readonly fields;
  readonly dynSizeFields;
  readonly _minSize;
  constructor(...fields: Fields) {
    super();
    this.fields = fields;
    this._minSize = this.fields.reduce((len, [_, field]) => len + field._minSize, 0);
    this.dynSizeFields = fields.filter(([_, field]) => !field._dynSizeZero);
    this._dynSizeZero = this.dynSizeFields.length === 0;
  }
  _dynSize(value: Flatten<NativeRecord<Fields>>) {
    let sum = 0;
    for (let i = 0; i < this.dynSizeFields.length; i++) {
      const [key, fieldEncoder] = this.dynSizeFields[i]!;
      sum += fieldEncoder._dynSize((value as any)[key]);
    }
    return sum;
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
}
export const record = <
  Fields extends Field<EntryKey, EntryValueCodec>[],
  EntryKey extends PropertyKey,
  EntryValueCodec extends Codec,
>(...fields: Fields): RecordCodec<Fields> => {
  return new RecordCodec(...fields);
};
