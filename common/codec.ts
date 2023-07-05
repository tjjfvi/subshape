import { AssertState } from "./assert.ts"
import { DecodeBuffer, EncodeBuffer } from "./buffer.ts"
import { Metadata } from "./metadata.ts"
import { ScaleAssertError, ScaleEncodeError } from "./util.ts"

export type Input<T extends AnyCodec> = T extends Codec<infer I, unknown> ? I : never
export type Output<T extends AnyCodec> = T extends Codec<never, infer O> ? O : never

export function createCodec<I, O = I>(
  _codec:
    & ThisType<Codec<I, O>>
    & Pick<Codec<I, O>, "_encode" | "_decode" | "_assert" | "_staticSize" | "_metadata">,
): Codec<I, O> {
  const { _staticSize, _encode, _assert, _decode, _metadata } = _codec
  const codec: Codec<I, O> = {
    // @ts-ignore https://gist.github.com/tjjfvi/ea194c4fce76dacdd60a0943256332aa
    __proto__: Codec.prototype,
    _staticSize,
    _encode,
    _decode,
    _assert,
    _metadata,
  }
  return codec
}

type NoInfer<T> = T extends infer U ? U : never
export function withMetadata<I, O>(metadata: Metadata<NoInfer<I>, NoInfer<O>>, codec: Codec<I, O>): Codec<I, O> {
  const result: Codec<I, O> = {
    // @ts-ignore https://gist.github.com/tjjfvi/ea194c4fce76dacdd60a0943256332aa
    __proto__: Codec.prototype,
    ...codec,
    _metadata: [...metadata as Metadata<I, O>, ...codec._metadata],
  }
  return result
}

const codecInspectCtx = new Map<AnyCodec, number | null>()
let codecInspectIdN = 0
const nodeCustomInspect = Symbol.for("nodejs.util.inspect.custom")
const denoCustomInspect = Symbol.for("Deno.customInspect")

abstract class _Codec {
  private [nodeCustomInspect](_0: unknown, _1: unknown, inspect: (value: unknown) => string) {
    return this._inspect(inspect)
  }

  private [denoCustomInspect](inspect: (value: unknown, opts: unknown) => string, opts: unknown) {
    return this._inspect((x) => inspect(x, opts))
  }

  // Properly handles circular codecs in the case of $.deferred
  private _inspect(inspect: (value: unknown) => string): string
  private _inspect(this: AnyCodec, inspect: (value: unknown) => string): string {
    let id = codecInspectCtx.get(this)
    if (id !== undefined) {
      if (id === null) {
        codecInspectCtx.set(this, id = codecInspectIdN++)
      }
      return `$${id}`
    }
    try {
      codecInspectCtx.set(this, null)
      const metadata = this._metadata[0]
      const content = metadata
        ? metadata.type === "atomic"
          ? metadata.name
          : `${metadata.name}(${inspect(metadata.args).replace(/^\[(?: (.+) |(.+))\]$/s, "$1$2")})`
        : "?"
      id = codecInspectCtx.get(this)
      return id !== null ? `$${id} = ${content}` : content
    } finally {
      codecInspectCtx.delete(this)
      if (codecInspectCtx.size === 0) codecInspectIdN = 0
    }
  }
}

export type AnyCodec = Codec<never, unknown>
export type Encodec<I> = Codec<I, unknown>
export type Decodec<O> = Codec<never, O>

export abstract class Codec<in I, out O = I> extends _Codec implements AnyCodec {
  /** A static estimation of the size, which may be an under- or over-estimate */
  abstract _staticSize: number
  /** Encodes the value into the supplied buffer, which should have at least `_staticSize` free byte. */
  abstract _encode: (buffer: EncodeBuffer, value: I) => void
  /** Decodes the value from the supplied buffer */
  abstract _decode: (buffer: DecodeBuffer) => O
  /** Asserts that the value is valid for this codec */
  abstract _assert: (state: AssertState) => void
  /** An array with metadata representing the construction of this codec */
  abstract _metadata: Metadata<I, O>

  /** Encodes the value into a new Uint8Array (throws if async) */
  encode(value: I) {
    const buf = new EncodeBuffer(this._staticSize)
    this._encode(buf, value)
    if (buf.asyncCount) throw new ScaleEncodeError(this, value, "Attempted to synchronously encode an async codec")
    return buf.finish()
  }

  /** Asynchronously encodes the value into a new Uint8Array */
  async encodeAsync(value: I) {
    const buf = new EncodeBuffer(this._staticSize)
    this._encode(buf, value)
    return buf.finishAsync()
  }

  /** Decodes a value from the supplied Uint8Array */
  decode(array: Uint8Array) {
    const buf = new DecodeBuffer(array)
    return this._decode(buf)
  }

  /** Requires the codec to have an explicit type annotation; if it doesn't, use `$.assert` instead. */
  assert(value: unknown): asserts value is I {
    assert(this, value)
  }
}

/** Asserts that the value is valid for the specified codec */
export function assert<I>(codec: Codec<I, unknown>, value: unknown): asserts value is I {
  codec._assert(new AssertState(value))
}

export function is<T>(codec: Codec<T>, value: unknown): value is T {
  try {
    codec._assert(new AssertState(value))
    return true
  } catch (e) {
    if (e instanceof ScaleAssertError) {
      return false
    } else {
      throw e
    }
  }
}
