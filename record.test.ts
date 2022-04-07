import * as s from "/mod.ts";
import * as f from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("Records", () => {
  const c = s.record(
    s.recordField("name", s.str),
    s.recordField("nickName", s.str),
    s.recordField("superPower", s.option(s.str)),
    s.recordField("luckyNumber", s.u8),
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
