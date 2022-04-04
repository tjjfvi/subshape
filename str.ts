import { Decoder, Encoder } from "/common.ts";
import { compactDecoder, compactEncoder } from "/compact.ts";

/** Decode a string */
export const strDecoder = new Decoder<string>((state) => {
  // TODO: do we like this conversion? Safeguard.
  const len = Number(compactDecoder._d(state));
  const slice = state.u8a.slice(state.i, state.i + len);
  state.i += len;
  return new TextDecoder().decode(slice);
});

/** Encode a string */
export const strEncoder = new Encoder<string>(
  (state, value) => {
    const len = strLength(value);
    compactEncoder._e(state, len);
    new TextEncoder().encodeInto(value, state.u8a.subarray(state.i));
    state.i += len;
  },
  (value) => {
    const len = strLength(value);
    return len + compactEncoder._s(len);
  },
);

/** Get the SCALE length (in bytes) of a given string */
const strLength = (value: string): number => {
  let len = value.length;
  for (let i = value.length - 1; i >= 0; i--) {
    const code = value.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) {
      len += 1;
    } else if (code > 0x7ff && code <= 0xffff) {
      len += 2;
    }
    if (code >= 0xdc00 && code <= 0xdfff) {
      i -= 1;
    }
  }
  return len;
};
