import { createCodec } from "../common.ts";

export const bool = createCodec<boolean>({
  _staticSize: 1,
  _encode(buffer, value) {
    buffer.array[buffer.index++] = +value;
  },
  _decode(buffer) {
    return !!buffer.array[buffer.index++]!;
  },
});
