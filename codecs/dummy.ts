import { Codec, createCodec, metadata } from "../common/mod.ts";

/**
 * `Dummy`'s decoder returns a hard-coded JS value and DOES NOT encode or decode from any bytes.
 * @param value The native value corresponding to the generically-supplied codec
 * @returns A dummy codec with the patched signature of `E`
 */
export function dummy<T>(value: T): Codec<T> {
  return createCodec({
    _metadata: metadata("$.dummy", dummy, value),
    _staticSize: 0,
    _encode() {},
    _decode() {
      return value;
    },
    _validate() {},
  });
}
