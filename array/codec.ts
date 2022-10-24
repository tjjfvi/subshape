import { Codec, createCodec, EncodeError } from "../common.ts";
import { compactU32 } from "../compact/codec.ts";

type ArrayOfLength<
  T,
  L extends number,
  A extends T[] = [],
> = number extends L ? T[]
  : L extends A["length"] ? A
  : ArrayOfLength<T, L, [...A, T]>;

export function sizedArray<L extends number, T>($el: Codec<T>, length: L): Codec<ArrayOfLength<T, L>> {
  return createCodec({
    name: "$.sizedArray",
    _metadata: [sizedArray, $el, length],
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

export function array<T>($el: Codec<T>): Codec<T[]> {
  return createCodec({
    name: "$.array",
    _metadata: [array, $el],
    _staticSize: compactU32._staticSize,
    _encode(buffer, value) {
      compactU32._encode(buffer, value.length);
      if (value.length) {
        buffer.pushAlloc(value.length * $el._staticSize);
        for (let i = 0; i < value.length; i++) {
          $el._encode(buffer, value[i]!);
        }
        buffer.popAlloc();
      }
    },
    _decode(buffer) {
      const length = compactU32._decode(buffer);
      const value: T[] = Array(length);
      for (let i = 0; i < value.length; i++) {
        value[i] = $el._decode(buffer);
      }
      return value;
    },
  });
}

export const uint8Array: Codec<Uint8Array> = createCodec({
  name: "$.uint8Array",
  _metadata: null,
  _staticSize: compactU32._staticSize,
  _encode(buffer, value) {
    compactU32._encode(buffer, value.length);
    buffer.insertArray(value); // the contents of this will eventually be cloned by buffer
  },
  _decode(buffer) {
    const length = compactU32._decode(buffer);
    const value = buffer.array.subarray(buffer.index, buffer.index + length);
    buffer.index += length;
    return value;
  },
});

export function sizedUint8Array(length: number): Codec<Uint8Array> {
  return createCodec({
    name: "$.sizedUint8Array",
    _metadata: [sizedUint8Array, length],
    // We could set `_staticSize` to `length`, but in this case it will usually
    // more efficient to insert the array dynamically, rather than manually copy
    // the bytes.
    _staticSize: 0,
    _encode(buffer, value) {
      if (value.length !== length) {
        throw new EncodeError(this, value, `Expected an array of size ${length}, got ${value.length}`);
      }
      buffer.insertArray(value); // the contents of this will eventually be cloned by buffer
    },
    _decode(buffer) {
      return buffer.array.subarray(buffer.index, buffer.index += length);
    },
  });
}

/** @deprecated Use `$.uint8Array` instead */
export const uint8array = uint8Array;

/** @deprecated Use `$.sizedUint8Array` instead */
export const sizedUint8array = sizedUint8Array;
