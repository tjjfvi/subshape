import * as asserts from "std/testing/asserts.ts";
import * as s from "../mod.ts";
import * as f from "../test-util.ts";

Deno.test("Records", () => {
  const c = s.record(
    ["name", s.str],
    ["nickName", s.str],
    ["superPower", s.option(s.str)],
    ["luckyNumber", s.u8],
  );
  f.visitFixtures(f.fixtures.record_, (bytes, decoded) => {
    asserts.assertEquals(c.decode(bytes), decoded);
    asserts.assertEquals(c.encode(decoded as any), bytes);
  }, (raw: string) => {
    return Object.entries(JSON.parse(raw)).reduce<Record<PropertyKey, any>>((acc, [key, value]) => {
      return {
        ...acc,
        [key]: value === null ? undefined : value,
      };
    }, {});
  });
});