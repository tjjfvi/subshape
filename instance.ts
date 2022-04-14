import { Codec } from "./common.ts";
import { Fields, NativeRecord, record } from "./record.ts";

export class Instance<Ctor extends new(...args: any[]) => any> extends Codec<InstanceType<Ctor>> {
  constructor(
    ctor: Ctor,
    // TODO: this signature is `never` (doesn't affect outward-facing types... nevertheless, fix this)
    ...fields: Fields<ConstructorParameters<Ctor>>
  ) {
    const rec = record(...fields);
    super(
      (value) => {
        return rec._s(value as NativeRecord<Fields<ConstructorParameters<Ctor>>>);
      },
      (cursor, value) => {
        rec._e(cursor, value as NativeRecord<Fields<ConstructorParameters<Ctor>>>);
      },
      (cursor) => {
        return new ctor(...fields.map((field) => {
          return (field[1] as any)._d(cursor);
        }));
      },
    );
  }
}
export const instance = <Ctor extends new(...args: any[]) => any>(
  ctor: Ctor,
  ...fields: Fields<ConstructorParameters<Ctor>>
) => {
  return new Instance(ctor, ...fields);
};
