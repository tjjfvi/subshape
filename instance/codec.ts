import { Codec, Entries, Native } from "../common.ts";
import { Field, NativeRecord, record } from "../record/codec.ts";

export class InstanceCodec<Ctor extends new(...args: any[]) => any> extends Codec<InstanceType<Ctor>> {
  constructor(
    ctor: Ctor,
    ...fields: Entries<InstanceType<Ctor>>
  ) {
    const rec = record(...fields);
    super(
      (value) => {
        // The param signature is `never`, yet this does not affect outward-facing types
        return rec._s(value as never);
      },
      (cursor, value) => {
        // ... same here
        rec._e(cursor, value as never);
      },
      (cursor) => {
        return new ctor(...fields.map((field) => {
          return field[1]._d(cursor);
        }));
      },
    );
  }
}

/**
 * @param ctor The constructor with which to instantiate the instance / from whose instance to encode
 * @param fields the ordered fields used to decode params for the constructor / encode from the instance
 * @returns the instance codec
 */
export const instance = <
  Ctor extends new(
    ...args: {
      [K in keyof Fields]: Native<Extract<Fields[K], Field>[1]>;
    }
  ) => NativeRecord<Fields>,
  Fields extends Field<EntryKey, EntryValueCodec>[],
  EntryKey extends PropertyKey,
  EntryValueCodec extends Codec,
>(
  ctor: Ctor,
  ...fields: Fields
) => {
  return new InstanceCodec(ctor, ...(fields as any));
};
