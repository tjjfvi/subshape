import { Decoder, Encoder, Native } from "/common.ts";
import { RecordFieldEncoder } from "/record.ts";
import { NativeTuple, TupleDecoder, TupleEncoder } from "/tuple.ts";

export class ErrorDecoder<
  ErrArgDecoders extends Decoder[],
  ErrCtor extends new(...params: NativeTuple<ErrArgDecoders>) => Error,
> extends Decoder<InstanceType<ErrCtor>> {
  constructor(
    errCtor: ErrCtor,
    ...errArgDecoders: ErrArgDecoders
  ) {
    super((cursor) => {
      const tuple = new TupleDecoder(...errArgDecoders);
      return new errCtor(...tuple._d(cursor)) as InstanceType<ErrCtor>;
    });
  }
}

export class ErrorEncoder<Err extends Error = Error> extends Encoder<Err> {
  // TODO: narrow!
  constructor(...fieldEncoders: RecordFieldEncoder[]) {
    super(
      (cursor, value) => {
        fieldEncoders.forEach((fieldEncoder) => {
          fieldEncoder._e(cursor, value);
        });
      },
      (value) => {
        return fieldEncoders.reduce((acc, fieldEncoder) => {
          return acc + fieldEncoder._s(value);
        }, 0);
      },
    );
  }
}

export class Ok<T> {
  constructor(readonly value: T) {}
}

export class ResultDecoder<
  OkDecoder extends Decoder,
  ErrCtor extends new(...params: NativeTuple<ErrArgDecoders>) => Error,
  ErrArgDecoders extends Decoder[],
> extends Decoder<InstanceType<ErrCtor> | Ok<Native<OkDecoder>>> {
  constructor(
    okDecoder: OkDecoder,
    errCtor: ErrCtor,
    ...errArgDecoders: ErrArgDecoders
  ) {
    super((cursor) => {
      const succeeded = cursor.view.getUint8(cursor.i);
      cursor.i += 1;
      switch (succeeded as 0 | 1) {
        case 0: {
          return new Ok(okDecoder._d(cursor));
        }
        case 1: {
          return new errCtor(...new TupleDecoder(...errArgDecoders)._d(cursor)) as InstanceType<ErrCtor>;
        }
      }
    });
  }
}

export class ResultEncoder<
  OkValueEncoder extends Encoder,
  ErrEncoder extends ErrorEncoder,
> extends Encoder<Ok<Native<OkValueEncoder>> | Native<ErrEncoder>> {
  constructor(
    okValueEncoder: OkValueEncoder,
    errEncoder: ErrEncoder,
  ) {
    super(
      (cursor, value) => {
        if (value instanceof Error) {
          cursor.view.setUint8(cursor.i, 1);
          cursor.i += 1;
          errEncoder._e(cursor, value);
        } else {
          cursor.view.setUint8(cursor.i, 0);
          cursor.i += 1;
          okValueEncoder._e(cursor, value.value);
        }
      },
      (value) => {
        return 1 + (value instanceof Error ? errEncoder._s(value) : okValueEncoder._s(value.value));
      },
    );
  }
}
