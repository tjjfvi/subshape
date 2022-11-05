import { Codec, createCodec, metadata, ScaleAssertError, ScaleDecodeError } from "../common/mod.ts";

export function constant<T>(value: T, codec: Pick<Codec<T>, "encode">): Codec<T>;
export function constant<T>(value: T, pattern?: Uint8Array): Codec<T>;
export function constant<T>(value: T, c?: Pick<Codec<T>, "encode"> | Uint8Array): Codec<T> {
  const pattern = c && (c instanceof Uint8Array ? c : c.encode(value));
  return createCodec({
    _metadata: metadata("$.constant", constant<T>, value, ...pattern ? [pattern] : []),
    // We could set `_staticSize` to `pattern.length`, but in this case it will
    // usually more efficient to insert `pattern` dynamically, rather than
    // manually copy the bytes.
    _staticSize: 0,
    _encode(buffer) {
      if (pattern) {
        buffer.insertArray(pattern);
      }
    },
    _decode(buffer) {
      if (pattern) {
        const got = buffer.array.subarray(buffer.index, buffer.index += pattern.length);
        for (let i = 0; i < pattern.length; i++) {
          if (pattern[i] !== got[i]) {
            throw new ScaleDecodeError(this, buffer, `Invalid pattern; expected ${hex(pattern)}, got ${hex(got)}`);
          }
        }
      }
      return value;
    },
    _assert(got) {
      if (got !== value) {
        throw new ScaleAssertError(this, got, `Invalid value; expected ${value}, got ${got}`);
      }
    },
  });
}

function hex(pattern: Uint8Array) {
  let str = "0x";
  for (let i = 0; i < pattern.length; i++) {
    str += pattern[i]!.toString(16).padStart(2, "0");
  }
  return str;
}
