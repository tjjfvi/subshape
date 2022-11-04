import { Codec, createCodec, DecodeError, EncodeError, metadata } from "../common/mod.ts";

export function constantPattern<T>(value: T, codec: Pick<Codec<T>, "encode">): Codec<T>;
export function constantPattern<T>(value: T, pattern: Uint8Array): Codec<T>;
export function constantPattern<T>(value: T, c: Pick<Codec<T>, "encode"> | Uint8Array): Codec<T> {
  const pattern = c instanceof Uint8Array ? c : c.encode(value);
  return createCodec({
    _metadata: metadata("$.constantPattern", constantPattern<T>, value, pattern),
    // We could set `_staticSize` to `pattern.length`, but in this case it will
    // usually more efficient to insert `pattern` dynamically, rather than
    // manually copy the bytes.
    _staticSize: 0,
    _encode(buffer, got) {
      if (got !== value) {
        throw new EncodeError(this, got, `Invalid value; expected ${value}, got ${got}`);
      }
      buffer.insertArray(pattern);
    },
    _decode(buffer) {
      const got = buffer.array.subarray(buffer.index, buffer.index += pattern.length);
      for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] !== got[i]) {
          throw new DecodeError(this, buffer, `Invalid pattern; expected ${hex(pattern)}, got ${hex(got)}`);
        }
      }
      return value;
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
