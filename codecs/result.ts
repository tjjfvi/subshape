import { Codec, createCodec, DecodeError, metadata } from "../common/mod.ts";

export function result<Ok, Err extends Error>(
  $ok: Codec<Ok>,
  $err: Codec<Err>,
): Codec<Ok | Err> {
  if ($ok._metadata.some((x) => x.factory === result)) {
    throw new Error("Nested result codec will not roundtrip correctly");
  }
  return createCodec({
    _metadata: metadata("$.result", result, $ok, $err),
    _staticSize: 1 + Math.max($ok._staticSize, $err._staticSize),
    _encode(buffer, value) {
      if ((buffer.array[buffer.index++] = +(value instanceof Error))) {
        $err._encode(buffer, value as Err);
      } else {
        $ok._encode(buffer, value as Ok);
      }
    },
    _decode(buffer) {
      switch (buffer.array[buffer.index++]) {
        case 0: {
          const value = $ok._decode(buffer);
          if (value instanceof Error) {
            throw new DecodeError(this, buffer, "An ok value that is instanceof Error will not roundtrip correctly");
          }
          return value;
        }
        case 1: {
          return $err._decode(buffer);
        }
        default: {
          throw new DecodeError(this, buffer, "Result discriminant neither 0 nor 1");
        }
      }
    },
    _validate(value) {
      if (value instanceof Error) {
        $err._validate(value);
      } else {
        $ok._validate(value);
      }
    },
  });
}
