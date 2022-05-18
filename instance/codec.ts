import { Codec, createCodec, Native } from "../common.ts";
import { Field, NativeObject, object } from "../object/codec.ts";

/**
 * @param ctor The constructor with which to instantiate the instance / from whose instance to encode
 * @param fields the ordered fields used to decode params for the constructor / encode from the instance
 * @returns the instance codec
 */
export function instance<
  Ctor extends new(
    ...args: {
      [K in keyof Fields]: Native<Extract<Fields[K], Field>[1]>;
    }
  ) => NativeObject<Fields>,
  Fields extends Field<EntryKey, EntryValueCodec>[],
  EntryKey extends PropertyKey,
  EntryValueCodec extends Codec<any>,
>(
  ctor: Ctor,
  ...fields: Fields
) {
  const $object = object(...fields);
  return createCodec<InstanceType<Ctor>>({
    ...$object as Codec<any>,
    _decode(buffer) {
      const arr = Array(fields.length);
      for (let i = 0; i < arr.length; i++) {
        arr[i] = fields[i]![1]._decode(buffer);
      }
      return new ctor(...arr as any) as any;
    },
  });
}
