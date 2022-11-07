import { AnyCodec } from "./codec.ts";
import { ScaleAssertError } from "./util.ts";

type TypeofMap = {
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  undefined: undefined;
  object: {} | null;
  function: Function;
};

export class AssertState<T = unknown> {
  constructor(public value: T, public pathPart: string = "value", public parent?: AssertState) {
  }

  get path(): string {
    return (this.parent?.path ?? "") + this.pathPart;
  }

  error(codec: AnyCodec, message: string) {
    return new ScaleAssertError(codec, this.value, message);
  }

  typeof<K extends keyof TypeofMap>(codec: AnyCodec, type: K): asserts this is AssertState<T & TypeofMap[K]> {
    // deno-lint-ignore valid-typeof
    if (typeof this.value !== type) {
      throw new ScaleAssertError(codec, this.value, `typeof ${this.path} !== "${type}"`);
    }
  }

  nonNull(codec: AnyCodec): asserts this is AssertState<T & {}> {
    if (this.value == null) {
      throw new ScaleAssertError(codec, this.value, `${this.path} == null`);
    }
  }

  instanceof<U>(codec: AnyCodec, ctor: abstract new(...args: any) => U): asserts this is AssertState<T & U> {
    if (!(this.value instanceof ctor)) {
      throw new ScaleAssertError(codec, this.value, `!(${this.path} instanceof ${ctor.name})`);
    }
  }

  hasKey<K extends keyof any>(
    this: AssertState<{}>,
    codec: AnyCodec,
    key: K,
  ): asserts this is AssertState<T & Record<K, unknown>> {
    if (!(key in this.value)) {
      throw new ScaleAssertError(codec, this.value, `!(${JSON.stringify(key)} in ${this.path})`);
    }
  }

  equals<U extends T>(codec: AnyCodec, value: U, label = `${value}`): asserts this is AssertState<U> {
    if (this.value !== value) {
      throw new ScaleAssertError(codec, this.value, `${this.path} !== ${label}`);
    }
  }

  access<K extends keyof T>(key: K): AssertState<T[K]> {
    const pathPart = typeof key === "string" && /^[^\W\d]\w*$/u.test(key)
      ? `.${key}`
      : `[${typeof key === "string" ? JSON.stringify(key) : key.toString()}]`;
    return new AssertState(this.value[key], pathPart, this);
  }

  integer(this: AssertState<number>, codec: AnyCodec) {
    if (this.value !== (this.value > 0 ? this.value >>> 0 : this.value >> 0)) {
      throw new ScaleAssertError(codec, this.value, `${this.path}: invalid int`);
    }
  }

  range(this: AssertState<number>, codec: AnyCodec, min: number, max: number): void;
  range(this: AssertState<bigint>, codec: AnyCodec, min: bigint, max: bigint): void;
  range(this: AssertState<number | bigint>, codec: AnyCodec, min: number | bigint, max: number | bigint): void {
    if (this.value < min) {
      throw new ScaleAssertError(codec, this.value, `${this.path} < ${min}`);
    }
    if (this.value > max) {
      throw new ScaleAssertError(codec, this.value, `${this.path} > ${max}`);
    }
  }

  with<T>(cb: (value: this) => T): T {
    return cb(this);
  }
}
