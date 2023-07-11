import { metadata, Shape, withMetadata } from "../common/mod.ts"

export function documented<I, O>(docs: string, inner: Shape<I, O>): Shape<I, O> {
  return withMetadata(
    metadata("$.documented", documented, docs, inner) as never,
    inner,
  )
}
