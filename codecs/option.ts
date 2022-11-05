import { Codec, createCodec, metadata, ScaleDecodeError } from "../common/mod.ts";

export function option<Some>($some: Codec<Some>): Codec<Some | undefined> {
  if ($some._metadata.some((x) => x.factory === option)) {
    throw new Error("Nested option codec will not roundtrip correctly");
  }
  return createCodec({
    _metadata: metadata("$.option", option, $some),
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
            throw new ScaleDecodeError(this, buffer, "An undefined some value will not roundtrip correctly");
          }
          return value;
        }
        default: {
          throw new ScaleDecodeError(this, buffer, "Option discriminant neither 0 nor 1");
        }
      }
    },
    _assert(value) {
      if (value === undefined) return;
      $some._assert(value);
    },
  });
}
