import * as s from "/mod.ts";
import * as fixtures from "/target/fixtures/mod.js";
import { visitFixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("U8s", () => {
  visitFixtures<number>(fixtures.u8_, (bytes, decoded) => {
    asserts.assertEquals(s.u8Decoder.decode(bytes), decoded);
    asserts.assertEquals(s.u8Encoder.encode(decoded), bytes);
  });
});

Deno.test("I8s", () => {
  visitFixtures<number>(fixtures.i8_, (bytes, decoded) => {
    asserts.assertEquals(s.i8Decoder.decode(bytes), decoded);
    asserts.assertEquals(s.i8Encoder.encode(decoded), bytes);
  });
});

Deno.test("U16s", () => {
  visitFixtures<number>(fixtures.u16_, (bytes, decoded) => {
    asserts.assertEquals(s.u16Decoder.decode(bytes), decoded);
    asserts.assertEquals(s.u16Encoder.encode(decoded), bytes);
  });
});

Deno.test("I16s", () => {
  visitFixtures<number>(fixtures.i16_, (bytes, decoded) => {
    asserts.assertEquals(s.i16Decoder.decode(bytes), decoded);
    asserts.assertEquals(s.i16Encoder.encode(decoded), bytes);
  });
});

Deno.test("U32s", () => {
  visitFixtures<number>(fixtures.u32_, (bytes, decoded) => {
    asserts.assertEquals(s.u32Decoder.decode(bytes), decoded);
    asserts.assertEquals(s.u32Encoder.encode(decoded), bytes);
  });
});

Deno.test("I32s", () => {
  visitFixtures<number>(fixtures.i32_, (bytes, decoded) => {
    asserts.assertEquals(s.i32Decoder.decode(bytes), decoded);
    asserts.assertEquals(s.i32Encoder.encode(decoded), bytes);
  });
});

Deno.test("U64s", () => {
  visitFixtures<bigint>(fixtures.u64_, (bytes, decoded) => {
    asserts.assertEquals(s.u64Decoder.decode(bytes), decoded);
    asserts.assertEquals(s.u64Encoder.encode(decoded), bytes);
  });
});

Deno.test("I64s", () => {
  visitFixtures<bigint>(fixtures.i64_, (bytes, decoded) => {
    asserts.assertEquals(s.i64Decoder.decode(bytes), decoded);
    asserts.assertEquals(s.i64Encoder.encode(decoded), bytes);
  });
});

Deno.test("U128s", () => {
  visitFixtures<bigint>(fixtures.u128_, (bytes, decoded) => {
    asserts.assertEquals(s.u128Decoder.decode(bytes), decoded);
    asserts.assertEquals(s.u128Encoder.encode(decoded), bytes);
  });
});

Deno.test("I128s", () => {
  visitFixtures<bigint>(fixtures.i128_, (bytes, decoded) => {
    asserts.assertEquals(s.i128Decoder.decode(bytes), decoded);
    asserts.assertEquals(s.i128Encoder.encode(decoded), bytes);
  });
});
