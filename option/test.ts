import * as asserts from "std/testing/asserts.ts";
import * as s from "../mod.ts";
import * as f from "../test-util.ts";

Deno.test("Options", () => {
  f.visitFixtures(f.fixtures.option_, (bytes, decoded, i) => {
    // Be explicit with an `any` type arg so that inference doesn't produce contravariance issue pertaining to
    // `string` and `number` args of supplied codec's `_s` methods.
    const o = s.option<any>(
      {
        0: s.str,
        1: s.u8,
        2: s.str,
        3: s.u32,
        4: undefined,
      }[i]!,
    );
    asserts.assertEquals(o.decode(bytes), decoded);
    asserts.assertEquals(o.encode(decoded), bytes);
  }, (raw: string) => {
    return JSON.parse(raw) || undefined;
  });
});

Deno.test("Boolean Options", () => {
  f.visitFixtures(f.fixtures.bool_option_, (bytes, decoded, i) => {
    asserts.assertEquals(s.option(s.bool).decode(bytes), decoded);
    asserts.assertEquals(s.option(s.bool).encode(decoded), bytes);
  }, f.constrainedIdentity<boolean | undefined>());
});
