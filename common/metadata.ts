import { Shape } from "./shape.ts"

export type Metadata<I, O> = Array<
  | {
    type: "atomic"
    name: string
    factory?: never
    args?: never
  }
  | {
    type: "factory"
    name: string
    factory: (...args: any) => Shape<I, O>
    args: any[]
  }
>

/** Metadata for an atomic shape */
export function metadata<I = any, O = any>(name: string): Metadata<I, O>
/** Metadata for a factory-made shape */
export function metadata<I, O, A extends unknown[]>(
  name: string,
  factory: (...args: A) => Shape<I, O>,
  ...args: A
): Metadata<I, O>
/** Concatenate multiple metadata arrays */
export function metadata<I, O>(...metadata: Metadata<I, O>[]): Metadata<I, O>
export function metadata<I, O>(
  ...fullArgs:
    | Metadata<I, O>[]
    | [
      name: string,
      factory?: (...args: any) => Shape<I, O>,
      ...args: any[],
    ]
): Metadata<I, O> {
  if (typeof fullArgs[0] !== "string") return fullArgs.flat()
  const [name, factory, ...args] = fullArgs as [name: string, factory?: (...args: any) => Shape<I, O>, ...args: any[]]
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

export class ShapeVisitor<R> {
  #fallback?: <I, O>(shape: Shape<I, O>) => R
  #visitors = new Map<Metadata<any, any>[number] | Function, (shape: Shape<any>, ...args: any[]) => R>()

  add<I, O, A extends unknown[]>(shape: (...args: A) => Shape<I, O>, fn: (shape: Shape<I, O>, ...args: A) => R): this
  add<I, O>(shape: Shape<I, O>, fn: (shape: Shape<I, O>) => R): this
  add(shape: Shape<any> | Metadata<any, any>[number] | Function, fn: (shape: Shape<any>, ...args: any[]) => R): this {
    if (shape instanceof Shape) {
      shape = shape.metadata[0]!
      if (!shape) throw new Error("Cannot register visitor for metadata-less shape")
    }
    if (this.#visitors.has(shape)) {
      throw new Error("Duplicate visitor")
    }
    this.#visitors.set(shape, fn)
    return this
  }

  fallback(fn: <I, O>(shape: Shape<I, O>) => R): this {
    if (this.#fallback) {
      throw new Error("Duplicate fallback")
    }
    this.#fallback = fn
    return this
  }

  /**
   * ```ts
   * visitor.generic(<T>() =>
   *   visitor.add($.array<T>, (shape, $el) => {
   *     ...
   *   })
   * )
   * ```
   */
  generic(fn: (visitor: this) => void): this {
    fn(this)
    return this
  }

  visit<I, O>(shape: Shape<I, O>): R {
    for (const metadata of shape.metadata) {
      let visitor = this.#visitors.get(metadata)
      if (visitor) return visitor(shape)
      if (metadata.type !== "factory") continue
      visitor = this.#visitors.get(metadata.factory)
      if (visitor) return visitor(shape, ...metadata.args)
    }
    if (this.#fallback) {
      return this.#fallback(shape)
    }
    throw new Error("Unrecognized shape")
  }
}
