import { Codec } from "./codec.ts"

export type Metadata<I, O> = Array<
  | {
    type: "atomic"
    name: string
    docs?: never
    factory?: never
    args?: never
  }
  | {
    type: "factory"
    name: string
    docs?: never
    factory: (...args: any) => Codec<I, O>
    args: any[]
  }
  | {
    type: "docs"
    docs: string
    factory?: never
    args?: never
  }
>

/** Metadata for an atomic codec */
export function metadata<I = any, O = any>(name: string): Metadata<I, O>
/** Metadata for a factory-made codec */
export function metadata<I, O, A extends unknown[]>(
  name: string,
  factory: (...args: A) => Codec<I, O>,
  ...args: A
): Metadata<I, O>
/** Concatenate multiple metadata arrays */
export function metadata<I, O>(...metadata: Metadata<I, O>[]): Metadata<I, O>
export function metadata<I, O>(
  ...fullArgs:
    | Metadata<I, O>[]
    | [
      name: string,
      factory?: (...args: any) => Codec<[I, O]>,
      ...args: any[],
    ]
): Metadata<I, O> {
  if (typeof fullArgs[0] !== "string") return fullArgs.flat()
  const [name, factory, ...args] = fullArgs as [name: string, factory?: (...args: any) => Codec<I, O>, ...args: any[]]
  return [
    factory
      ? {
        type: "factory",
        name,
        factory,
        args,
      }
      : {
        type: "atomic",
        name,
      },
  ]
}

export function docs<I = any, O = any>(docs: string): Metadata<I, O> {
  return [{ type: "docs", docs }]
}

export class CodecVisitor<R> {
  #fallback?: <I, O>(codec: Codec<I, O>) => R
  #visitors = new Map<Metadata<any, any>[number] | Function, (codec: Codec<any>, ...args: any[]) => R>()

  add<I, O, A extends unknown[]>(codec: (...args: A) => Codec<I, O>, fn: (codec: Codec<I, O>, ...args: A) => R): this
  add<I, O>(codec: Codec<I, O>, fn: (codec: Codec<I, O>) => R): this
  add(codec: Codec<any> | Metadata<any, any>[number] | Function, fn: (codec: Codec<any>, ...args: any[]) => R): this {
    if (codec instanceof Codec) {
      codec = codec._metadata[0]!
      if (!codec) throw new Error("Cannot register visitor for metadata-less codec")
    }
    if (this.#visitors.has(codec)) {
      throw new Error("Duplicate visitor")
    }
    this.#visitors.set(codec, fn)
    return this
  }

  fallback(fn: <I, O>(codec: Codec<I, O>) => R): this {
    if (this.#fallback) {
      throw new Error("Duplicate fallback")
    }
    this.#fallback = fn
    return this
  }

  /**
   * ```ts
   * visitor.generic(<T>() =>
   *   visitor.add($.array<T>, (codec, $el) => {
   *     ...
   *   })
   * )
   * ```
   */
  generic(fn: (visitor: this) => void): this {
    fn(this)
    return this
  }

  visit<I, O>(codec: Codec<I, O>): R {
    for (const metadata of codec._metadata) {
      let visitor = this.#visitors.get(metadata)
      if (visitor) return visitor(codec)
      if (metadata.type !== "factory") continue
      visitor = this.#visitors.get(metadata.factory)
      if (visitor) return visitor(codec, ...metadata.args)
    }
    if (this.#fallback) {
      return this.#fallback(codec)
    }
    throw new Error("Unrecognized codec")
  }
}
