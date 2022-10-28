import { AnyCodec, Codec, createCodec, Expand, Narrow, Native, U2I } from "../common/mod.ts";

export type AnyField = [key: keyof any, value: AnyCodec];

export type NativeField<F extends AnyField> = { [_ in F[0]]: Native<F[1]> };

// // TODO: do we prefer the following (variadic) approach?
export type NativeObject<O extends AnyField[]> = Expand<
  U2I<
    | {}
    | {
      // @ts-ignore passes deno but failing dnt
      [K in keyof O]: Record<O[K][0], Native<O[K][1]>>;
    }[number]
  >
>;

export function object<O extends AnyField[]>(...fields: Narrow<O>): Codec<NativeObject<O>>;
export function object<O extends AnyField[]>(...fields: O): Codec<NativeObject<O>> {
  return createCodec({
    name: "$.object",
    _metadata: [object, ...fields] as any,
    _staticSize: fields.map((x) => x[1]._staticSize).reduce((a, b) => a + b, 0),
    _encode(buffer, value) {
      fields.forEach(([key, fieldEncoder]) => {
        fieldEncoder._encode(buffer, (value as any)[key] as never);
      });
    },
    _decode(buffer) {
      const obj: Record<string, unknown> = {};
      for (let i = 0; i < fields.length; i++) {
        const [key, field] = fields[i]!;
        obj[key as any] = field._decode(buffer);
      }
      return obj as any;
    },
  });
}
