import { Codec, createCodec, metadata } from "../common/mod.ts";
import { compact } from "./compact.ts";
import { u32 } from "./int.ts";

const compactU32 = compact(u32);

type ArrayOfLength<
  T,
  L extends number,
  A extends T[] = [],
> = number extends L ? T[]
  : L extends A["length"] ? A
  : ArrayOfLength<T, L, [...A, T]>;

export function sizedArray<L extends number, T>($el: Codec<T>, length: L): Codec<ArrayOfLength<T, L>> {
  return createCodec({
    _metadata: metadata("$.sizedArray", sizedArray, $el, length),
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
    _assert(assert) {
      assert.instanceof(this, Array);
      assert.key(this, "length").equals(this, length);
      for (let i = 0; i < length; i++) {
        $el._assert(assert.key(this, i));
      }
    },
  });
}

export function array<T>($el: Codec<T>): Codec<T[]> {
  return createCodec({
    _metadata: metadata("$.array", array, $el),
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
    _assert(assert) {
      assert.instanceof(this, Array);
      for (let i = 0; i < (assert.value as unknown[]).length; i++) {
        $el._assert(assert.key(this, i));
      }
    },
  });
}

export const uint8Array: Codec<Uint8Array> = createCodec({
  _metadata: metadata("$.uint8Array"),
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
  _assert(assert) {
    assert.instanceof(this, Uint8Array);
  },
});

export function sizedUint8Array(length: number): Codec<Uint8Array> {
  return createCodec({
    _metadata: metadata("$.sizedUint8Array", sizedUint8Array, length),
    // We could set `_staticSize` to `length`, but in this case it will usually
    // more efficient to insert the array dynamically, rather than manually copy
    // the bytes.
    _staticSize: 0,
    _encode(buffer, value) {
      buffer.insertArray(value); // the contents of this will eventually be cloned by buffer
    },
    _decode(buffer) {
      return buffer.array.subarray(buffer.index, buffer.index += length);
    },
    _assert(assert) {
      assert.instanceof(this, Uint8Array);
      assert.key(this, "length").equals(this, length);
    },
  });
}
