import { Codec, createCodec, Narrow, Native } from "../common/mod.ts";
import { AnyField, NativeObject, object } from "./object.ts";

/**
 * @param ctor The constructor with which to instantiate the instance / from whose instance to encode
 * @param fields the ordered fields used to decode params for the constructor / encode from the instance
 * @returns the instance codec
 */
export function instance<
  Ctor extends new(
    ...args: {
      [K in keyof Fields]: Native<Extract<Fields[K], AnyField>[1]>;
    }
  ) => NativeObject<Fields>,
  Fields extends AnyField[],
>(
  ctor: Ctor,
  ...fields: Narrow<Fields>
): Codec<InstanceType<Ctor>> {
  const $object = object(...fields);
  return createCodec({
    ...$object as Codec<any>,
    name: "$.instance",
    _metadata: [instance, ctor, ...fields] as any,
    _decode(buffer) {
      const arr = Array(fields.length);
      for (let i = 0; i < arr.length; i++) {
        arr[i] = (fields as Fields)[i]![1]._decode(buffer);
      }
      return new ctor(...arr as any) as any;
    },
  });
}
