import { Decoder, Encoder, Native } from "/common.ts";
import { NativeRecord, RecordDecoder, RecordFieldDecoder } from "/record.ts";

// TODO: do we also need encoders for results?

export class ErrorDecoder<
  ErrFieldDecoders extends RecordFieldDecoder[],
  ErrCtor extends new(props: NativeRecord<ErrFieldDecoders>) => Error & NativeRecord<ErrFieldDecoders>,
> extends Decoder<InstanceType<ErrCtor>> {
  constructor(
    errCtor: ErrCtor,
    ...errFieldDecoders: ErrFieldDecoders
  ) {
    super((cursor) => {
      const record = new RecordDecoder(...errFieldDecoders);
      return new errCtor(record._d(cursor)) as InstanceType<ErrCtor>;
    });
  }
}

export class Ok<T> {
  constructor(readonly value: T) {}
}

export class ResultDecoder<
  ErrFieldDecoders extends RecordFieldDecoder[],
  ErrCtor extends new(props: NativeRecord<ErrFieldDecoders>) => Error & NativeRecord<ErrFieldDecoders>,
  OkDecoder extends Decoder,
> extends Decoder<InstanceType<ErrCtor> | Ok<Native<OkDecoder>>> {
  constructor(
    errFieldDecoders: ErrFieldDecoders,
    errCtor: ErrCtor,
    okDecoder: OkDecoder,
  ) {
    super((cursor) => {
      const succeeded = cursor.view.getUint8(cursor.i);
      switch (succeeded as 0 | 1) {
        case 0: {
          return new errCtor(new RecordDecoder(...errFieldDecoders)._d(cursor)) as InstanceType<ErrCtor>;
        }
        case 1: {
          return new Ok(okDecoder._d(cursor));
        }
      }
    });
  }
}
