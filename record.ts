import { Codec, Native } from "./common.ts";

export type NativeField<
  Key extends PropertyKey = PropertyKey,
  ValueCodec extends Codec = Codec,
> = { [_ in Key]: Native<ValueCodec> };

export type NativeRecord<FieldCodec extends Codec<NativeField>[] = Codec<NativeField>[]> = FieldCodec extends [] ? {}
  : FieldCodec extends [Codec<infer FieldT>, ...infer ERest]
    ? FieldT & (ERest extends Codec<NativeField>[] ? NativeRecord<ERest> : never)
  : {};

export class Field<
  Key extends PropertyKey = PropertyKey,
  ValueCodec extends Codec = Codec,
> extends Codec<NativeField<Key, ValueCodec>> {
  constructor(
    key: Key,
    valueCodec: ValueCodec,
  ) {
    super(
      (value) => {
        return valueCodec._s(value[key]);
      },
      (cursor, value) => {
        return valueCodec._e(cursor, value[key]);
      },
      (cursor) => {
        return { [key]: valueCodec._d(cursor) } as NativeField<Key, ValueCodec>;
      },
    );
  }
}
export const field = <
  Key extends PropertyKey = PropertyKey,
  ValueCodec extends Codec = Codec,
>(
  key: Key,
  valueCodec: ValueCodec,
): Field<Key, ValueCodec> => {
  return new Field(key, valueCodec);
};

export class Record<FieldCodecs extends Field[] = Field[]> extends Codec<NativeRecord<FieldCodecs>> {
  constructor(...fieldCodecs: FieldCodecs) {
    super(
      (value) => {
        return fieldCodecs.reduce<number>((len, fieldEncoder) => {
          return len + fieldEncoder._s(value);
        }, 0);
      },
      (cursor, value) => {
        fieldCodecs.forEach((fieldEncoder) => {
          fieldEncoder._e(cursor, value);
        });
      },
      (cursor) => {
        return fieldCodecs.reduce<Partial<NativeRecord<FieldCodecs>>>((acc, fieldCodec) => {
          return {
            ...acc,
            ...fieldCodec._d(cursor),
          };
        }, {}) as NativeRecord<FieldCodecs>;
      },
    );
  }
}
export const record = <FieldCodecs extends Field[]>(...fieldCodecs: FieldCodecs): Record<FieldCodecs> => {
  return new Record(...fieldCodecs);
};
