import { createCodec } from "../common.ts";
import { compact } from "../compact/codec.ts";

export const str = createCodec<string>({
  _staticSize: compact._staticSize,
  _encode(buffer, value) {
    const array = new TextEncoder().encode(value);
    compact._encode(buffer, array.length);
    buffer.insertArray(array);
  },
  _decode(buffer) {
    // TODO: do we like this conversion? Safeguard.
    const len = Number(compact._decode(buffer));
    if (buffer.array.length < buffer.index + len) {
      throw new Error("Attempting to `str`-decode beyond bounds of input bytes");
    }
    const slice = buffer.array.slice(buffer.index, buffer.index + len);
    buffer.index += len;
    return new TextDecoder().decode(slice);
  },
});
