import { Codec, Cursor, Entries, Native } from "../common.ts";
import { Field, NativeRecord, RecordCodec } from "../record/codec.ts";

// The typings here are somewhat janky, in order to be able to use the implementation
// from RecordCodec directly, but have it be typed as though it extends from Codec directly
export interface InstanceCodec<Ctor extends new(...args: any[]) => any> {
  fields: Field<string, Codec<any>>[];
  _minSize: number;
  _dynSize(value: InstanceType<Ctor>): number;
  _encode(cursor: Cursor, value: InstanceType<Ctor>): number;
}
export class InstanceCodec<Ctor extends new(...args: any[]) => any>
  extends (RecordCodec as typeof Codec)<InstanceType<Ctor>>
{
  constructor(
    readonly ctor: Ctor,
    ...fields: Entries<InstanceType<Ctor>>
  ) {
    super(...fields as []);
  }

  _decode(cursor: Cursor): InstanceType<Ctor> {
    const arr = Array(this.fields.length);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = this.fields[i]![1]._decode(cursor);
    }
    return new this.ctor(...arr);
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
