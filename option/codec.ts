import { Codec, createCodec } from "../common.ts";

export function option<Some>($some: Codec<Some>): Codec<Some | undefined> {
  return createCodec({
    _metadata: [option, $some],
    _staticSize: 1 + $some._staticSize,
    _encode(buffer, value) {
      buffer.array[buffer.index++] = +(value !== undefined);
      if (value !== undefined) {
        $some._encode(buffer, value);
      }
    },
    _decode(buffer) {
      switch (buffer.array[buffer.index++]) {
        case 0: {
          return undefined;
        }
        case 1: {
          return $some._decode(buffer);
        }
        default: {
          throw new Error("Could not decode Option as `Some(_)` nor `None`");
        }
      }
    },
  });
}
