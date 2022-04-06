import { Codec, Native } from "/common.ts";
import { NativeRecord, Record, RecordField } from "/record.ts";

export class Err<
  Ctor extends new(props: NativeRecord<FieldCodecs>) => Error = new() => Error,
  FieldCodecs extends RecordField[] = RecordField[],
> extends Codec<InstanceType<Ctor>> {
  constructor(
    ctor: Ctor,
    ...fieldCodecs: FieldCodecs
  ) {
    super(
      (value) => {
        return fieldCodecs.reduce((acc, fieldEncoder) => {
          return acc + fieldEncoder._s(value);
        }, 0);
      },
      (cursor, value) => {
        fieldCodecs.forEach((fieldEncoder) => {
          fieldEncoder._e(cursor, value);
        });
      },
      (cursor) => {
        return new ctor(new Record(...fieldCodecs)._d(cursor)) as InstanceType<Ctor>;
      },
    );
  }
}

export class Ok<T> {
  constructor(readonly value: T) {}
}

// Make union
export class Result<
  ErrCodec extends Err,
  OkCodec extends Codec,
> extends Codec<Native<ErrCodec> | Ok<Native<OkCodec>>> {
  constructor(
    errCodec: ErrCodec,
    okCodec: OkCodec,
  ) {
    super(
      (value) => {
        return 1 + (value instanceof Error ? errCodec._s(value) : okCodec._s(value.value));
      },
      (cursor, value) => {
        if (value instanceof Error) {
          cursor.view.setUint8(cursor.i, 1);
          cursor.i += 1;
          errCodec._e(cursor, value);
        } else {
          cursor.view.setUint8(cursor.i, 0);
          cursor.i += 1;
          okCodec._e(cursor, value.value);
        }
      },
      (cursor) => {
        const succeeded = cursor.view.getUint8(cursor.i);
        cursor.i += 1;
        switch (succeeded as 0 | 1) {
          case 0: {
            return new Ok(okCodec._d(cursor));
          }
          case 1: {
            return errCodec._d(cursor) as Native<ErrCodec>;
          }
        }
      },
    );
  }
}
