import type { DecodeBuffer } from "./buffer.ts"
import type { AnyShape } from "./shape.ts"

export abstract class ShapeError extends Error {
  constructor(readonly shape: AnyShape, message: string) {
    super(message)
  }
}

export class ShapeAssertError extends ShapeError {
  override readonly name = "ShapeAssertError"
  constructor(shape: AnyShape, readonly value: unknown, message: string) {
    super(shape, message)
  }
}

export class ShapeEncodeError extends ShapeError {
  override readonly name = "ShapeEncodeError"
  constructor(shape: AnyShape, readonly value: unknown, message: string) {
    super(shape, message)
  }
}

export class ShapeDecodeError extends ShapeError {
  override readonly name = "ShapeDecodeError"
  constructor(shape: AnyShape, readonly buffer: DecodeBuffer, message: string) {
    super(shape, message)
  }
}

export type Expand<T> = T extends T ? { [K in keyof T]: T[K] } : never
export type U2I<U> = (U extends U ? (u: U) => 0 : never) extends (i: infer I) => 0 ? Extract<I, U> : never

type _Narrow<T, U> = [U] extends [T] ? U : Extract<T, U>
export type Narrow<T = unknown> =
  | _Narrow<T, 0 | number & {}>
  | _Narrow<T, 0n | bigint & {}>
  | _Narrow<T, "" | string & {}>
  | _Narrow<T, boolean>
  | _Narrow<T, symbol>
  | _Narrow<T, []>
  | _Narrow<T, { [_: PropertyKey]: Narrow }>
  | (T extends object ? { [K in keyof T]: Narrow<T[K]> } : never)
  | Extract<{} | null | undefined, T>
