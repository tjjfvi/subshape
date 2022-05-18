import { Codec, createCodec } from "../common.ts";
import { compact } from "../compact/codec.ts";

type ArrayOfLength<
  L extends number,
  T,
  A extends T[] = [],
> = number extends L ? T[]
  : L extends A["length"] ? A
  : ArrayOfLength<L, T, [...A, T]>;

export function sizedArray<L extends number, T>(length: L, $el: Codec<T>) {
  return createCodec<ArrayOfLength<L, T>>({
    _staticSize: $el._staticSize * length,
    _encode(buffer, value) {
      for (let i = 0; i < value.length; i++) {
        $el._encode(buffer, value[i]!);
      }
    },
    _decode(buffer) {
      const value: T[] = Array(length);
      for (let i = 0; i < value.length; i++) {
        value[i] = $el._decode(buffer);
      }
      return value as ArrayOfLength<L, T>;
    },
  });
}

export function array<T>($el: Codec<T>) {
  return createCodec<T[]>({
    _staticSize: compact._staticSize,
    _encode(buffer, value) {
      compact._encode(buffer, value.length);
      if (value.length) {
        buffer.pushAlloc(value.length * $el._staticSize);
        for (let i = 0; i < value.length; i++) {
          $el._encode(buffer, value[i]!);
        }
        buffer.popAlloc();
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
