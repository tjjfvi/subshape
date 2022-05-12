import { Codec } from "../common.ts";
import { InstanceCodec } from "../instance/codec.ts";
import { UnionCodec } from "../union/codec.ts";

export class ResultCodec<
  Ok,
  Err extends Error,
> extends UnionCodec<[Ok, Err]> {
  constructor(
    okCodec: Codec<Ok>,
    errCodec: InstanceCodec<new(...args: any[]) => Err>,
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
  errCodec: InstanceCodec<new(...args: any[]) => any>,
): ResultCodec<Ok, Err> => {
  return new ResultCodec(okCodec, errCodec);
};
