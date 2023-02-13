import { Codec } from "./codec.ts"

export type Metadata<T> = Array<
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
    factory: (...args: any) => Codec<T>
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
export function metadata<T = any>(name: string): Metadata<T>
/** Metadata for a factory-made codec */
export function metadata<T, A extends unknown[]>(
  name: string,
  factory: (...args: A) => Codec<T>,
  ...args: A
): Metadata<T>
/** Concatenate multiple metadata arrays */
export function metadata<T>(...metadata: Metadata<T>[]): Metadata<T>
export function metadata<T>(
  ...fullArgs:
    | Metadata<T>[]
    | [
      name: string,
      factory?: (...args: any) => Codec<T>,
      ...args: any[],
    ]
): Metadata<T> {
  if (typeof fullArgs[0] !== "string") return fullArgs.flat()
  const [name, factory, ...args] = fullArgs as [name: string, factory?: (...args: any) => Codec<T>, ...args: any[]]
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

export function docs<T = any>(docs: string): Metadata<T> {
  return [{ type: "docs", docs }]
}

export class CodecVisitor<R> {
  #fallback?: <T>(codec: Codec<T>) => R
  #visitors = new Map<Codec<any> | Function, (codec: Codec<any>, ...args: any[]) => R>()

  add<T, A extends unknown[]>(codec: (...args: A) => Codec<T>, fn: (codec: Codec<T>, ...args: A) => R): this
  add<T>(codec: Codec<T>, fn: (codec: Codec<T>) => R): this
  add(codec: Codec<any> | Function, fn: (codec: Codec<any>, ...args: any[]) => R): this {
    if (this.#visitors.has(codec)) {
      throw new Error("Duplicate visitor")
    }
    this.#visitors.set(codec, fn)
    return this
  }

  fallback(fn: <T>(codec: Codec<T>) => R): this {
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

  visit<T>(codec: Codec<T>): R {
    const visitor = this.#visitors.get(codec)
    if (visitor) return visitor(codec)
    for (const metadata of codec._metadata) {
      if (metadata.type !== "factory") continue
      const visitor = this.#visitors.get(metadata.factory)
      if (visitor) return visitor(codec, ...metadata.args)
    }
    if (this.#fallback) {
      return this.#fallback(codec)
    }
    throw new Error("Unrecognized codec")
  }
}
