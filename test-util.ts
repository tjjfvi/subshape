import { Codec } from "./common.ts";
export * as fixtures from "./target/fixtures/scale_fixtures.js";

export const visitFixtures = <D, N>(
  getFixtures: () => Map<Uint8Array, D>,
  visit: (
    bytes: Uint8Array,
    decoded: N,
    i: number,
  ) => void,
  normalize: (raw: D) => N,
) => {
  let count = 0;
  for (const [bytes, decoded] of getFixtures().entries()) {
    visit(bytes, normalize(decoded), count);
    count += 1;
  }
};

export const constrainedIdentity = <T>() => {
  return (t: T) => t;
};

export function benchCodec<T>(name: string, codec: Codec<T>, value: T) {
  Deno.bench(`- ${name} [encode]`, () => {
    codec.encode(value);
  });
  const encoded = codec.encode(value);
  Deno.bench(`  ${name} [decode]`, () => {
    codec.decode(encoded);
  });
}
