import { Codec } from "./codec.ts";

export class CodecVisitor<R> {
  #fallback?: <T>(codec: Codec<T>) => R;
  #visitors = new Map<Codec<any> | Function, (codec: Codec<any>, ...args: any[]) => R>();

  constructor() {}

  add<T, A extends unknown[]>(codec: (...args: A) => Codec<T>, fn: (codec: Codec<T>, ...args: A) => R): this;
  add<T>(codec: Codec<T>, fn: (codec: Codec<T>) => R): this;
  add(codec: Codec<any> | Function, fn: (codec: Codec<any>, ...args: any[]) => R): this {
    if (this.#visitors.has(codec)) {
      throw new Error("Duplicate visitor");
    }
    this.#visitors.set(codec, fn);
    return this;
  }

  fallback(fn: <T>(codec: Codec<T>) => R): this {
    if (this.#fallback) {
      throw new Error("Duplicate fallback");
    }
    this.#fallback = fn;
    return this;
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
    fn(this);
    return this;
  }

  visit<T>(codec: Codec<T>): R {
    const visitor = this.#visitors.get(codec);
    if (visitor) return visitor(codec);
    if (codec._metadata) {
      const visitor = this.#visitors.get(codec._metadata[0]);
      if (visitor) return visitor(codec, ...codec._metadata.slice(1));
    }
    if (this.#fallback) {
      return this.#fallback(codec);
    }
    throw new Error("Unrecognized codec");
  }
}
