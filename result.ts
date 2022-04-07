import { Codec, Native } from "/common.ts";
import { Union } from "/union.ts";

// TODO: extract `Instance` codec that allows instantiation of a supplied ctor

export interface DataBearer<D> {
  data: D;
}

export class Err<
  ErrDataCodec extends Codec = Codec,
  Ctor extends new(errData: Native<ErrDataCodec>) => Error & DataBearer<Native<ErrDataCodec>> = new(
    err: Native<ErrDataCodec>,
  ) => Error & Native<ErrDataCodec>,
> extends Codec<InstanceType<Ctor>> {
  constructor(
    ctor: Ctor,
    errDataCodec: ErrDataCodec,
  ) {
    super(
      (value) => {
        // TODO: confirm the `as` doesn't cause problems elsewhere
        return errDataCodec._s(value.data);
      },
      (cursor, value) => {
        // TODO: confirm the `as` doesn't cause problems elsewhere
        return errDataCodec._e(cursor, value.data);
      },
      (cursor) => {
        return new ctor(errDataCodec._d(cursor) as Native<ErrDataCodec>) as InstanceType<Ctor>;
      },
    );
  }
}

export interface OkBearer<T = any> {
  ok: T;
}

export class Ok<
  ValueCodec extends Codec = Codec,
  Ctor extends new(ok: Native<ValueCodec>) => OkBearer<Native<ValueCodec>> = new(
    ok: Native<ValueCodec>,
  ) => OkBearer<Native<ValueCodec>>,
> extends Codec<InstanceType<Ctor>> {
  constructor(
    ctor: Ctor,
    valueCodec: ValueCodec,
  ) {
    super(
      (value) => {
        return valueCodec._s(value.ok);
      },
      (cursor, value) => {
        valueCodec._e(cursor, value.ok);
      },
      (cursor) => {
        return new ctor(valueCodec._d(cursor)) as InstanceType<Ctor>;
      },
    );
  }
}

export class Result<
  OkCodec extends Ok,
  ErrCodec extends Err,
> extends Union<[OkCodec, ErrCodec]> {
  constructor(
    okCodec: OkCodec,
    errCodec: ErrCodec,
  ) {
    super(
      (value) => {
        return value instanceof Error ? 1 : 0;
      },
      okCodec,
      errCodec,
    );
  }
}
