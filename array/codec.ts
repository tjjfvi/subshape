import { Codec, createCodec } from "../common.ts";
import { compact } from "../compact/codec.ts";

export function array<T>($el: Codec<T>) {
  const { _encode: compact_encode, _decode: compact_decode } = compact;
  const { _encode, _decode } = $el;
  return createCodec<T[]>({
    _staticSize: 4,
    _encode(buffer, value) {
      compact_encode(buffer, value.length);
      if (value.length) {
        buffer.push(value.length * $el._staticSize);
        for (let i = 0; i < value.length; i++) {
          _encode(buffer, value[i]!);
        }
        buffer.pop();
      }
    },
    _decode(buffer) {
      const length = Number(compact_decode(buffer));
      const value: T[] = Array(length);
      for (let i = 0; i < value.length; i++) {
        value[i] = _decode(buffer);
      }
      return value;
    },
  });
}
