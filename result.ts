import { Decoder, Native } from "/common.ts";
import { NativeTuple, TupleDecoder } from "/tuple.ts";

// TODO: do we also need encoders for results?

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
        case 1: {
          return new errCtor(...new TupleDecoder(...errArgDecoders)._d(cursor)) as InstanceType<ErrCtor>;
        }
        case 0: {
          return new Ok(okDecoder._d(cursor));
        }
      }
    });
  }
}
