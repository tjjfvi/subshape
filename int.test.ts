import * as s from "/mod.ts";
import { fixtures, visitFixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("U8s", () => {
  visitFixtures<number>(fixtures.u8_, (bytes, decoded) => {
    asserts.assertEquals(s.u8.decode(bytes), decoded);
    asserts.assertEquals(s.u8.encode(decoded), bytes);
  });
});

Deno.test("I8s", () => {
  visitFixtures<number>(fixtures.i8_, (bytes, decoded) => {
    asserts.assertEquals(s.i8.decode(bytes), decoded);
    asserts.assertEquals(s.i8.encode(decoded), bytes);
  });
});

Deno.test("U16s", () => {
  visitFixtures<number>(fixtures.u16_, (bytes, decoded) => {
    asserts.assertEquals(s.u16.decode(bytes), decoded);
    asserts.assertEquals(s.u16.encode(decoded), bytes);
  });
});

Deno.test("I16s", () => {
  visitFixtures<number>(fixtures.i16_, (bytes, decoded) => {
    asserts.assertEquals(s.i16.decode(bytes), decoded);
    asserts.assertEquals(s.i16.encode(decoded), bytes);
  });
});

Deno.test("U32s", () => {
  visitFixtures<number>(fixtures.u32_, (bytes, decoded) => {
    asserts.assertEquals(s.u32.decode(bytes), decoded);
    asserts.assertEquals(s.u32.encode(decoded), bytes);
  });
});

Deno.test("I32s", () => {
  visitFixtures<number>(fixtures.i32_, (bytes, decoded) => {
    asserts.assertEquals(s.i32.decode(bytes), decoded);
    asserts.assertEquals(s.i32.encode(decoded), bytes);
  });
});

Deno.test("U64s", () => {
  visitFixtures<bigint>(fixtures.u64_, (bytes, decoded) => {
    asserts.assertEquals(s.u64.decode(bytes), decoded);
    asserts.assertEquals(s.u64.encode(decoded), bytes);
  });
});

Deno.test("I64s", () => {
  visitFixtures<bigint>(fixtures.i64_, (bytes, decoded) => {
    asserts.assertEquals(s.i64.decode(bytes), decoded);
    asserts.assertEquals(s.i64.encode(decoded), bytes);
  });
});

Deno.test("U128s", () => {
  visitFixtures<bigint>(fixtures.u128_, (bytes, decoded) => {
    asserts.assertEquals(s.u128.decode(bytes), decoded);
    asserts.assertEquals(s.u128.encode(decoded), bytes);
  });
});

Deno.test("I128s", () => {
  visitFixtures<bigint>(fixtures.i128_, (bytes, decoded) => {
    asserts.assertEquals(s.i128.decode(bytes), decoded);
    asserts.assertEquals(s.i128.encode(decoded), bytes);
  });
});
