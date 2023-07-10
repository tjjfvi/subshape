import { AssertState } from "./assert.ts"
import { DecodeBuffer, EncodeBuffer } from "./buffer.ts"
import { Metadata } from "./metadata.ts"
import { ShapeAssertError, ShapeEncodeError } from "./util.ts"

export type Input<T extends AnyShape> = T extends Shape<infer I, unknown> ? I : never
export type Output<T extends AnyShape> = T extends Shape<never, infer O> ? O : never

export function createShape<I, O = I>(
  _shape:
    & ThisType<Shape<I, O>>
    & Pick<Shape<I, O>, "_encode" | "_decode" | "_assert" | "_staticSize" | "_metadata">,
): Shape<I, O> {
  const { _staticSize, _encode, _assert, _decode, _metadata } = _shape
  const shape: Shape<I, O> = {
    // @ts-ignore https://gist.github.com/tjjfvi/ea194c4fce76dacdd60a0943256332aa
    __proto__: Shape.prototype,
    _staticSize,
    _encode,
    _decode,
    _assert,
    _metadata,
  }
  return shape
}

type NoInfer<T> = T extends infer U ? U : never
export function withMetadata<I, O>(metadata: Metadata<NoInfer<I>, NoInfer<O>>, shape: Shape<I, O>): Shape<I, O> {
  const result: Shape<I, O> = {
    // @ts-ignore https://gist.github.com/tjjfvi/ea194c4fce76dacdd60a0943256332aa
    __proto__: Shape.prototype,
    ...shape,
    _metadata: [...metadata as Metadata<I, O>, ...shape._metadata],
  }
  return result
}

const shapeInspectCtx = new Map<AnyShape, number | null>()
let shapeInspectIdN = 0
const nodeCustomInspect = Symbol.for("nodejs.util.inspect.custom")
const denoCustomInspect = Symbol.for("Deno.customInspect")

abstract class _Shape {
  private [nodeCustomInspect](_0: unknown, _1: unknown, inspect: (value: unknown) => string) {
    return this._inspect(inspect)
  }

  private [denoCustomInspect](inspect: (value: unknown, opts: unknown) => string, opts: unknown) {
    return this._inspect((x) => inspect(x, opts))
  }

  // Properly handles circular shapes in the case of $.deferred
  private _inspect(inspect: (value: unknown) => string): string
  private _inspect(this: AnyShape, inspect: (value: unknown) => string): string {
    let id = shapeInspectCtx.get(this)
    if (id !== undefined) {
      if (id === null) {
        shapeInspectCtx.set(this, id = shapeInspectIdN++)
      }
      return `$${id}`
    }
    try {
      shapeInspectCtx.set(this, null)
      const metadata = this._metadata[0]
      const content = metadata
        ? metadata.type === "atomic"
          ? metadata.name
          : `${metadata.name}(${inspect(metadata.args).replace(/^\[(?: (.+) |(.+))\]$/s, "$1$2")})`
        : "?"
      id = shapeInspectCtx.get(this)
      return id !== null ? `$${id} = ${content}` : content
    } finally {
      shapeInspectCtx.delete(this)
      if (shapeInspectCtx.size === 0) shapeInspectIdN = 0
    }
  }
}

export type AnyShape = Shape<never, unknown>
export type InShape<I> = Shape<I, unknown>
export type OutShape<O> = Shape<never, O>

export abstract class Shape<in I, out O = I> extends _Shape implements AnyShape {
  /** A static estimation of the size, which may be an under- or over-estimate */
  abstract _staticSize: number
  /** Encodes the value into the supplied buffer, which should have at least `_staticSize` free byte. */
  abstract _encode: (buffer: EncodeBuffer, value: I) => void
  /** Decodes the value from the supplied buffer */
  abstract _decode: (buffer: DecodeBuffer) => O
  /** Asserts that the value is valid for this shape */
  abstract _assert: (state: AssertState) => void
  /** An array with metadata representing the construction of this shape */
  abstract _metadata: Metadata<I, O>

  /** Encodes the value into a new Uint8Array (throws if async) */
  encode(value: I) {
    const buf = new EncodeBuffer(this._staticSize)
    this._encode(buf, value)
    if (buf.asyncCount) throw new ShapeEncodeError(this, value, "Attempted to synchronously encode an async shape")
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

  /** Requires the shape to have an explicit type annotation; if it doesn't, use `$.assert` instead. */
  assert(value: unknown): asserts value is I {
    assert(this, value)
  }
}

/** Asserts that the value is valid for the specified shape */
export function assert<I>(shape: Shape<I, unknown>, value: unknown): asserts value is I {
  shape._assert(new AssertState(value))
}

export function is<T>(shape: Shape<T>, value: unknown): value is T {
  try {
    shape._assert(new AssertState(value))
    return true
  } catch (e) {
    if (e instanceof ShapeAssertError) {
      return false
    } else {
      throw e
    }
  }
}
