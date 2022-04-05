import { Decoder, Encoder, Native, Transcoder } from "/common.ts";

/** Native representation of a record field */
export type NativeRecordField<
  Key extends PropertyKey = PropertyKey,
  ValueTranscoder extends Transcoder = Transcoder,
> = { [_ in Key]: Native<ValueTranscoder> };

/** Native representation of a record */
export type NativeRecord<FieldTranscoders extends Transcoder<NativeRecordField>[] = Transcoder<NativeRecordField>[]> =
  FieldTranscoders extends [] ? {}
    : FieldTranscoders extends [Transcoder<infer FieldT>, ...infer ERest]
      ? FieldT & (ERest extends Transcoder<NativeRecordField>[] ? NativeRecord<ERest> : never)
    : {};

/** Decode a record field */
export class RecordFieldDecoder<
  Key extends PropertyKey = PropertyKey,
  ValueDecoder extends Decoder = Decoder,
> extends Decoder<NativeRecordField<Key, ValueDecoder>> {
  /**
   * @param key The key aside which the value should be decoded
   * @param valueDecoder The field value decoder
   */
  constructor(
    readonly key: Key,
    readonly valueDecoder: ValueDecoder,
  ) {
    super((cursor) => {
      return { [key]: valueDecoder._d(cursor) } as NativeRecordField<Key, ValueDecoder>;
    });
  }
}

/** Encode a record field */
export class RecordFieldEncoder<
  Key extends PropertyKey = PropertyKey,
  ValueEncoder extends Encoder = Encoder,
> extends Encoder<NativeRecordField<Key, ValueEncoder>> {
  /**
   * @param key The key with which the to-be-decoded value can be accessed
   * @param valueEncoder The encoder to use on the `key`-accessed value
   */
  constructor(
    readonly key: Key,
    readonly valueEncoder: ValueEncoder,
  ) {
    super(
      (cursor, value) => {
        return valueEncoder._e(cursor, value[key]);
      },
      (value) => {
        return valueEncoder._s(value[key]);
      },
    );
  }
}

/** Decode a record */
export class RecordDecoder<FieldDecoders extends RecordFieldDecoder[] = RecordFieldDecoder[]>
  extends Decoder<NativeRecord<FieldDecoders>>
{
  /**
   * @param fieldDecoders The ordered list of record field decoders
   */
  constructor(...fieldDecoders: FieldDecoders) {
    super((cursor) => {
      return fieldDecoders.reduce<Partial<NativeRecord<FieldDecoders>>>((acc, fieldDecoder) => {
        return {
          ...acc,
          ...fieldDecoder._d(cursor),
        };
      }, {}) as NativeRecord<FieldDecoders>;
    });
  }
}

// TODO: the `typeof fieldEncoder["T"]` assertion needs to go!
/** Encode a record */
export class RecordEncoder<FieldEncoders extends RecordFieldEncoder[] = RecordFieldEncoder[]>
  extends Encoder<NativeRecord<FieldEncoders>>
{
  /**
   * @param fieldsEncoders The ordered list of record field encoders
   */
  constructor(...fieldsEncoders: FieldEncoders) {
    super(
      (cursor, value) => {
        fieldsEncoders.forEach((fieldEncoder) => {
          fieldEncoder._e(cursor, value);
        });
      },
      (value) => {
        return fieldsEncoders.reduce<number>((len, fieldEncoder) => {
          return len + fieldEncoder._s(value);
        }, 0);
      },
    );
  }
}
