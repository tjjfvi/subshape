import { Codec } from "../common.ts";
import { Instance } from "../instance/codec.ts";
import { Union } from "../union/codec.ts";

export class Result<
  Ok,
  Err extends Error,
> extends Union<[Ok, Err]> {
  constructor(
    okCodec: Codec<Ok>,
    errCodec: Instance<new(...args: any[]) => Err>,
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
export const result = <
  Ok,
  Err extends Error,
>(
  okCodec: Codec<Ok>,
  errCodec: Instance<new(...args: any[]) => any>,
): Result<Ok, Err> => {
  return new Result(okCodec, errCodec);
};
