import { Codec, createCodec } from "../common.ts";
import { compact } from "../compact/codec.ts";

export function array<T>($el: Codec<T>) {
  return createCodec<T[]>({
    _staticSize: 4,
    _encode(buffer, value) {
      compact._encode(buffer, value.length);
      if (value.length) {
        buffer.push(value.length * $el._staticSize);
        for (let i = 0; i < value.length; i++) {
          $el._encode(buffer, value[i]!);
        }
        buffer.pop();
      }
    },
    _decode(buffer) {
      const length = Number(compact._decode(buffer));
      const value: T[] = Array(length);
      for (let i = 0; i < value.length; i++) {
        value[i] = $el._decode(buffer);
      }
      return value;
    },
  });
}
