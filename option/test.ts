import * as asserts from "std/testing/asserts.ts";
import * as $ from "../mod.ts";
import * as f from "../test-util.ts";

Deno.test("Options", () => {
  f.visitFixtures(f.fixtures.option_, (bytes, decoded, i) => {
    // Be explicit with an `any` type arg so that inference doesn't produce contravariance issue pertaining to
    // `string` and `number` args of supplied codec's `_s` methods.
    const o = $.option<any>(
      {
        0: $.str,
        1: $.u8,
        2: $.str,
        3: $.u32,
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
    asserts.assertEquals($.option($.bool).decode(bytes), decoded);
    asserts.assertEquals($.option($.bool).encode(decoded), bytes);
  }, f.constrainedIdentity<boolean | undefined>());
});
