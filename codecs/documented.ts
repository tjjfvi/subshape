import { Codec, metadata, withMetadata } from "../common/mod.ts"

export function documented<I, O>(docs: string, inner: Codec<I, O>): Codec<I, O> {
  return withMetadata(
    metadata("$.documented", documented, docs, inner) as never,
    inner,
  )
}
