import { Codec, createCodec } from "../common.ts";
import { nCompact } from "../compact/codec.ts";

export const bitSequence: Codec<Uint8Array> = createCodec({
  _metadata: null,
  _staticSize: 0,
  _encode(_buffer, _value) {
    // TODO
    return undefined!;
  },
  _decode(buffer) {
    const len = Math.ceil(nCompact._decode(buffer) / 8);
    const beg = buffer.index;
    const end = buffer.index += len;
    return buffer.array.subarray(beg, end);
  },
});
