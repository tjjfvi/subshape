import { DecodeBuffer, EncodeBuffer } from "./buffer.ts";
import { Metadata } from "./metadata.ts";
import { EncodeError } from "./util.ts";

export interface Codec<T> {
  /** Encodes a value into a new Uint8Array (throws if async) */
  encode: (value: T, validate?: boolean) => Uint8Array;
  /** Asynchronously encodes a value into a new Uint8Array */
  encodeAsync: (value: T, validate?: boolean) => Promise<Uint8Array>;
  /** Decodes a value from a Uint8Array */
  decode: (buffer: Uint8Array) => T;

  /** [implementation] A static estimation of the size, which may be an under- or over-estimate */
  _staticSize: number;
  /** [implementation] Encodes the value into the supplied buffer */
  _encode: (buffer: EncodeBuffer, value: T) => void;
  /** [implementation] Decodes the value from the supplied buffer */
  _decode: (buffer: DecodeBuffer) => T;

  _validate: (value: unknown) => asserts value is T;

  /**
   * If present, a factory function and the corresponding arguments.
   * `undefined` indicates that this codec is atomic (e.g. `$.str`).
   */
  _metadata: Metadata<T>;
}

export type AnyCodec = Codec<any> | Codec<never>;
export type Native<T extends AnyCodec> = T extends Codec<infer U> ? U : never;

export function createCodec<T>(
  _codec:
    & ThisType<Codec<T>>
    & Pick<Codec<T>, "_encode" | "_decode" | "_validate" | "_staticSize" | "_metadata">,
): Codec<T> {
  const { _staticSize, _encode, _validate, _decode, _metadata } = _codec;
  const codec: Codec<T> = {
    // @ts-ignore https://gist.github.com/tjjfvi/ea194c4fce76dacdd60a0943256332aa
    __proto__: Codec.prototype,
    _staticSize,
    _encode,
    _decode,
    _validate,
    _metadata,
    encode(value, validate = false) {
      if (validate) _codec._validate(value);
      const buf = new EncodeBuffer(_staticSize);
      _encode.call(codec, buf, value);
      if (buf.asyncCount) throw new EncodeError(codec, value, "Attempted to synchronously encode an async codec");
      return buf.finish();
    },
    async encodeAsync(value, validate = false) {
      if (validate) _codec._validate(value);
      const buf = new EncodeBuffer(_staticSize);
      _encode.call(codec, buf, value);
      return buf.finishAsync();
    },
    decode(array) {
      const buf = new DecodeBuffer(array);
      return _decode.call(codec, buf);
    },
  };
  return codec;
}

export function withMetadata<T>(metadata: Metadata<T>, codec: Codec<T>): Codec<T> {
  const result: Codec<T> = {
    // @ts-ignore https://gist.github.com/tjjfvi/ea194c4fce76dacdd60a0943256332aa
    __proto__: Codec.prototype,
    ...codec,
    _metadata: [...metadata, ...codec._metadata],
  };
  return result;
}

const codecInspectCtx = new Map<Codec<any>, number | null>();
let codecInspectIdN = 0;
const nodeCustomInspect = Symbol.for("nodejs.util.inspect.custom");
const denoCustomInspect = Symbol.for("Deno.customInspect");
abstract class _Codec<T> {
  [nodeCustomInspect](_0: unknown, _1: unknown, inspect: (value: unknown) => string) {
    return this._inspect(inspect);
  }

  [denoCustomInspect](inspect: (value: unknown, opts: unknown) => string, opts: unknown) {
    return this._inspect((x) => inspect(x, opts));
  }

  // Properly handles circular codecs in the case of $.deferred
  _inspect(inspect: (value: unknown) => string): string;
  _inspect(this: Codec<T>, inspect: (value: unknown) => string): string {
    let id = codecInspectCtx.get(this);
    if (id !== undefined) {
      if (id === null) {
        codecInspectCtx.set(this, id = codecInspectIdN++);
      }
      return `$${id}`;
    }
    try {
      codecInspectCtx.set(this, null);
      const metadata = this._metadata[0];
      if (!metadata) return "?";
      const content = metadata.type === "atomic"
        ? metadata.name
        : `${metadata.name}(${inspect(metadata.args).replace(/^\[(?: (.+) |(.+))\]$/s, "$1$2")})`;
      id = codecInspectCtx.get(this);
      return id !== null ? `$${id} = ${content}` : content;
    } finally {
      codecInspectCtx.delete(this);
      if (codecInspectCtx.size === 0) codecInspectIdN = 0;
    }
  }
}
export abstract class Codec<T> extends _Codec<T> {}
