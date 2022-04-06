import * as s from "/mod.ts";
import { fixtures, visitFixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

const normalize = (raw: string): Record<PropertyKey, any> => {
  return Object.entries(JSON.parse(raw)).reduce<Record<PropertyKey, any>>((acc, [key, value]) => {
    return {
      ...acc,
      [key]: value === null ? undefined : value,
    };
  }, {});
};

Deno.test("Records", () => {
  const c = new s.Record(
    new s.RecordField("name", s.str),
    new s.RecordField("nickName", s.str),
    new s.RecordField("superPower", new s.Option(s.str)),
    new s.RecordField("luckyNumber", s.u8),
  );
  visitFixtures<string>(fixtures.record_, (bytes, decoded) => {
    const normalized = normalize(decoded);
    asserts.assertEquals(c.decode(bytes), normalized);
    asserts.assertEquals(c.encode(normalized as any), bytes);
  });
});
