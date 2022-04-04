import * as s from "/mod.ts";
import { record_ } from "/target/fixtures/mod.js";
import { visitFixtures } from "/test-util.ts";
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
  const _0D = new s.RecordDecoder(
    new s.RecordFieldDecoder("name", s.strDecoder),
    new s.RecordFieldDecoder("nickName", s.strDecoder),
    new s.RecordFieldDecoder("superPower", new s.OptionDecoder(s.strDecoder)),
    new s.RecordFieldDecoder("luckyNumber", s.u8Decoder),
  );
  const _0E = new s.RecordEncoder(
    new s.RecordFieldEncoder("name", s.strEncoder),
    new s.RecordFieldEncoder("nickName", s.strEncoder),
    new s.RecordFieldEncoder("superPower", new s.OptionEncoder(s.strEncoder)),
    new s.RecordFieldEncoder("luckyNumber", s.u8Encoder),
  );
  visitFixtures<string>(record_, (bytes, decoded) => {
    const normalized = normalize(decoded);
    asserts.assertEquals(_0D.decode(bytes), normalized);
    asserts.assertEquals(_0E.encode(normalized as any), bytes);
  });
});
