import { Codec, Native } from "/common.ts";

/** Native representation of a record field */
export type NativeRecordField<
  Key extends PropertyKey = PropertyKey,
  ValueCodec extends Codec = Codec,
> = { [_ in Key]: Native<ValueCodec> };

/** Native representation of a record */
export type NativeRecord<FieldCodec extends Codec<NativeRecordField>[] = Codec<NativeRecordField>[]> =
  FieldCodec extends [] ? {}
    : FieldCodec extends [Codec<infer FieldT>, ...infer ERest]
      ? FieldT & (ERest extends Codec<NativeRecordField>[] ? NativeRecord<ERest> : never)
    : {};

export class RecordField<
  Key extends PropertyKey = PropertyKey,
  ValueCodec extends Codec = Codec,
> extends Codec<NativeRecordField<Key, ValueCodec>> {
  constructor(
    readonly key: Key,
    readonly valueCodec: ValueCodec,
  ) {
    super(
      (value) => {
        return valueCodec._s(value[key]);
      },
      (cursor, value) => {
        return valueCodec._e(cursor, value[key]);
      },
      (cursor) => {
        return { [key]: valueCodec._d(cursor) } as NativeRecordField<Key, ValueCodec>;
      },
    );
  }
}

export class Record<FieldCodecs extends RecordField[] = RecordField[]> extends Codec<NativeRecord<FieldCodecs>> {
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
