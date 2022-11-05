import { DecodeBuffer, EncodeBuffer } from "./buffer.ts";
import { Metadata } from "./metadata.ts";
import { ScaleAssertError, ScaleEncodeError } from "./util.ts";

export type AnyCodec = Codec<any> | Codec<never>;
export type Native<T extends AnyCodec> = T extends Codec<infer U> ? U : never;

export function createCodec<T>(
  _codec:
    & ThisType<Codec<T>>
    & Pick<Codec<T>, "_encode" | "_decode" | "_assert" | "_staticSize" | "_metadata">,
): Codec<T> {
  const { _staticSize, _encode, _assert, _decode, _metadata } = _codec;
  const codec: Codec<T> = {
    // @ts-ignore https://gist.github.com/tjjfvi/ea194c4fce76dacdd60a0943256332aa
    __proto__: Codec.prototype,
    _staticSize,
    _encode,
    _decode,
    _assert,
    _metadata,
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
export abstract class Codec<T> {
  /** [implementation] A static estimation of the size, which may be an under- or over-estimate */
  abstract _staticSize: number;
  /** [implementation] Encodes the value into the supplied buffer */
  abstract _encode: (buffer: EncodeBuffer, value: T) => void;
  /** [implementation] Decodes the value from the supplied buffer */
  abstract _decode: (buffer: DecodeBuffer) => T;

  abstract _assert: (value: unknown) => asserts value is T;

  /**
   * If present, a factory function and the corresponding arguments.
   * `undefined` indicates that this codec is atomic (e.g. `$.str`).
   */
  abstract _metadata: Metadata<T>;

  encode(value: T) {
    const buf = new EncodeBuffer(this._staticSize);
    this._encode(buf, value);
    if (buf.asyncCount) throw new ScaleEncodeError(this, value, "Attempted to synchronously encode an async codec");
    return buf.finish();
  }

  async encodeAsync(value: T) {
    const buf = new EncodeBuffer(this._staticSize);
    this._encode(buf, value);
    return buf.finishAsync();
  }

  decode(array: Uint8Array) {
    const buf = new DecodeBuffer(array);
    return this._decode(buf);
  }

  private [nodeCustomInspect](_0: unknown, _1: unknown, inspect: (value: unknown) => string) {
    return this._inspect(inspect);
  }

  private [denoCustomInspect](inspect: (value: unknown, opts: unknown) => string, opts: unknown) {
    return this._inspect((x) => inspect(x, opts));
  }

  // Properly handles circular codecs in the case of $.deferred
  private _inspect(inspect: (value: unknown) => string): string;
  private _inspect(this: Codec<T>, inspect: (value: unknown) => string): string {
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

export function assert<T>(codec: Codec<T>, value: unknown): asserts value is T {
  codec._assert(value);
}

export function is<T>(codec: Codec<T>, value: unknown): value is T {
  try {
    codec._assert(value);
    return true;
  } catch (e) {
    if (e instanceof ScaleAssertError) {
      return false;
    } else {
      throw e;
    }
  }
}
