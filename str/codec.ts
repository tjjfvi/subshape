import { Codec, createCodec, DecodeError } from "../common.ts";
import { compactU32 } from "../compact/codec.ts";

export const str: Codec<string> = createCodec({
  name: "str",
  _metadata: null,
  _staticSize: compactU32._staticSize,
  _encode(buffer, value) {
    const array = new TextEncoder().encode(value);
    compactU32._encode(buffer, array.length);
    buffer.insertArray(array);
  },
  _decode(buffer) {
    const len = compactU32._decode(buffer);
    if (buffer.array.length < buffer.index + len) {
      throw new DecodeError(this, buffer, "Attempting to `str`-decode beyond bounds of input bytes");
    }
    const slice = buffer.array.slice(buffer.index, buffer.index + len);
    buffer.index += len;
    return new TextDecoder().decode(slice);
  },
});
