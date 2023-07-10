import { AnyShape } from "./shape.ts"
import { ScaleAssertError } from "./util.ts"

type TypeofMap = {
  string: string
  number: number
  bigint: bigint
  boolean: boolean
  undefined: undefined
  object: {} | null
  function: Function
}

export class AssertState {
  constructor(public value: unknown, public pathPart: string = "value", public parent?: AssertState) {
  }

  get path(): string {
    return (this.parent?.path ?? "") + this.pathPart
  }

  typeof<K extends keyof TypeofMap>(shape: AnyShape, type: K) {
    // deno-lint-ignore valid-typeof
    if (typeof this.value !== type) {
      throw new ScaleAssertError(shape, this.value, `typeof ${this.path} !== "${type}"`)
    }
  }

  nonNull(shape: AnyShape) {
    if (this.value == null) {
      throw new ScaleAssertError(shape, this.value, `${this.path} == null`)
    }
  }

  instanceof(shape: AnyShape, ctor: abstract new(...args: any) => unknown) {
    if (!(this.value instanceof ctor)) {
      throw new ScaleAssertError(shape, this.value, `!(${this.path} instanceof ${ctor.name})`)
    }
  }

  key(shape: AnyShape, key: keyof any) {
    this.typeof(shape, "object")
    this.nonNull(shape)
    if (!(key in (this.value as object))) {
      throw new ScaleAssertError(shape, this.value, `!(${JSON.stringify(key)} in ${this.path})`)
    }
    const pathPart = typeof key === "string" && /^[^\W\d]\w*$/u.test(key)
      ? `.${key}`
      : `[${typeof key === "string" ? JSON.stringify(key) : key.toString()}]`
    return new AssertState((this.value as any)[key], pathPart, this)
  }

  equals(shape: AnyShape, value: unknown, label = `${value}`) {
    if (this.value !== value) {
      throw new ScaleAssertError(shape, this.value, `${this.path} !== ${label}`)
    }
  }

  integer(shape: AnyShape, min: number, max: number) {
    this.typeof(shape, "number")
    const value = this.value as number
    if (value !== (value > 0 ? value >>> 0 : value >> 0)) {
      throw new ScaleAssertError(shape, this.value, `${this.path}: invalid int`)
    }
    if (value < min) {
      throw new ScaleAssertError(shape, this.value, `${this.path} < ${min}`)
    }
    if (value > max) {
      throw new ScaleAssertError(shape, this.value, `${this.path} > ${max}`)
    }
  }

  bigint(shape: AnyShape, min: bigint, max: bigint) {
    this.typeof(shape, "bigint")
    const value = this.value as bigint
    if (value < min) {
      throw new ScaleAssertError(shape, this.value, `${this.path} < ${min}n`)
    }
    if (value > max) {
      throw new ScaleAssertError(shape, this.value, `${this.path} > ${max}n`)
    }
  }
}
