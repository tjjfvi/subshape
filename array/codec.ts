import { Codec, createCodec } from "../common.ts";
import { compact } from "../compact/codec.ts";

type ArrayOfLength<
  T,
  L extends number,
  A extends T[] = [],
> = number extends L ? T[]
  : L extends A["length"] ? A
  : ArrayOfLength<T, L, [...A, T]>;

export function sizedArray<L extends number, T>($el: Codec<T>, length: L) {
  return createCodec<ArrayOfLength<T, L>>({
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
      return value as ArrayOfLength<T, L>;
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

export const uint8array = createCodec<Uint8Array>({
  _staticSize: compact._staticSize,
  _encode(buffer, value) {
    compact._encode(buffer, value.length);
    buffer.insertArray(value); // the contents of this will eventually be cloned by buffer
  },
  _decode(buffer) {
    const length = Number(compact._decode(buffer));
    const value = buffer.array.subarray(buffer.index, buffer.index + length);
    buffer.index += length;
    return value;
  },
});

export function sizedUint8array(length: number) {
  return createCodec<Uint8Array>({
    // We could set `_staticSize` to `length`, but in this case it will usually
    // more efficient to insert the array dynamically, rather than manually copy
    // the bytes.
    _staticSize: 0,
    _encode(buffer, value) {
      if (value.length !== length) throw new Error(`Expected an array of size ${length}, got ${value.length}`);
      buffer.insertArray(value); // the contents of this will eventually be cloned by buffer
    },
    _decode(buffer) {
      return buffer.array.subarray(buffer.index, buffer.index += length);
    },
  });
}
