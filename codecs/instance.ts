import { Codec, createCodec, metadata, Narrow, Native, ValidateError } from "../common/mod.ts";
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
  const $object: Codec<InstanceType<Ctor>> = object(...fields) as any;
  return createCodec({
    _metadata: metadata("$.instance", instance<Ctor, Fields>, ctor, ...fields),
    _staticSize: $object._staticSize,
    _encode: $object._encode,
    _decode(buffer) {
      const arr = Array(fields.length);
      for (let i = 0; i < arr.length; i++) {
        arr[i] = (fields as Fields)[i]![1]._decode(buffer);
      }
      return new ctor(...arr as any) as any;
    },
    _validate(value) {
      if (!(value instanceof ctor)) {
        throw new ValidateError(this, value, `!(value instanceof ${ctor.name})`);
      }
      $object._validate(value);
    },
  });
}
