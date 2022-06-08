import { Codec, createCodec } from "../common.ts";

export function constantPattern<T>(value: T, codec: Codec<T>): Codec<T>;
export function constantPattern<T>(value: T, pattern: Uint8Array): Codec<T>;
export function constantPattern<T>(value: T, c: Codec<T> | Uint8Array): Codec<T> {
  const pattern = c instanceof Uint8Array ? c : c.encode(value);
  return createCodec<T>({
    // We could set `_staticSize` to `pattern.length`, but in this case it will
    // usually more efficient to insert `pattern` dynamically, rather than
    // manually copy the bytes.
    _staticSize: 0,
    _encode(buffer, got) {
      if (got !== value) {
        throw new Error(`Invalid value; expected ${Deno.inspect(value)}, got ${Deno.inspect(got)}`);
      }
      buffer.insertArray(pattern);
    },
    _decode(buffer) {
      const got = buffer.array.subarray(buffer.index, buffer.index += pattern.length);
      for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] !== got[i]) {
          throw new Error(`Invalid pattern; expected ${hex(pattern)}, got ${hex(got)}`);
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
