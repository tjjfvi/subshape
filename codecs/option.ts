import { Codec, createCodec, DecodeError } from "../common/mod.ts";

export function option<Some>($some: Codec<Some>): Codec<Some | undefined> {
  if ($some._metadata?.[0] === option) {
    throw new Error("Nested option codec will not roundtrip correctly");
  }
  return createCodec({
    name: "$.option",
    _metadata: [option, $some],
    _staticSize: 1 + $some._staticSize,
    _encode(buffer, value) {
      if ((buffer.array[buffer.index++] = +(value !== undefined))) {
        $some._encode(buffer, value!);
      }
    },
    _decode(buffer) {
      switch (buffer.array[buffer.index++]) {
        case 0: {
          return undefined;
        }
        case 1: {
          const value = $some._decode(buffer);
          if (value === undefined) {
            throw new DecodeError(this, buffer, "An undefined some value will not roundtrip correctly");
          }
          return value;
        }
        default: {
          throw new DecodeError(this, buffer, "Option discriminant neither 0 nor 1");
        }
      }
    },
  });
}
