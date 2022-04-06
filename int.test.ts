import * as s from "/mod.ts";
import * as f from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

Deno.test("U8s", () => {
  f.visitFixtures(f.fixtures.u8_, (bytes, decoded) => {
    asserts.assertEquals(s.u8.decode(bytes), decoded);
    asserts.assertEquals(s.u8.encode(decoded), bytes);
  }, f.constrainedIdentity<number>());
});

Deno.test("I8s", () => {
  f.visitFixtures(f.fixtures.i8_, (bytes, decoded) => {
    asserts.assertEquals(s.i8.decode(bytes), decoded);
    asserts.assertEquals(s.i8.encode(decoded), bytes);
  }, f.constrainedIdentity<number>());
});

Deno.test("U16s", () => {
  f.visitFixtures(f.fixtures.u16_, (bytes, decoded) => {
    asserts.assertEquals(s.u16.decode(bytes), decoded);
    asserts.assertEquals(s.u16.encode(decoded), bytes);
  }, f.constrainedIdentity<number>());
});

Deno.test("I16s", () => {
  f.visitFixtures(f.fixtures.i16_, (bytes, decoded) => {
    asserts.assertEquals(s.i16.decode(bytes), decoded);
    asserts.assertEquals(s.i16.encode(decoded), bytes);
  }, f.constrainedIdentity<number>());
});

Deno.test("U32s", () => {
  f.visitFixtures(f.fixtures.u32_, (bytes, decoded) => {
    asserts.assertEquals(s.u32.decode(bytes), decoded);
    asserts.assertEquals(s.u32.encode(decoded), bytes);
  }, f.constrainedIdentity<number>());
});

Deno.test("I32s", () => {
  f.visitFixtures(f.fixtures.i32_, (bytes, decoded) => {
    asserts.assertEquals(s.i32.decode(bytes), decoded);
    asserts.assertEquals(s.i32.encode(decoded), bytes);
  }, f.constrainedIdentity<number>());
});

Deno.test("U64s", () => {
  f.visitFixtures(f.fixtures.u64_, (bytes, decoded) => {
    asserts.assertEquals(s.u64.decode(bytes), decoded);
    asserts.assertEquals(s.u64.encode(decoded), bytes);
  }, f.constrainedIdentity<bigint>());
});

Deno.test("I64s", () => {
  f.visitFixtures(f.fixtures.i64_, (bytes, decoded) => {
    asserts.assertEquals(s.i64.decode(bytes), decoded);
    asserts.assertEquals(s.i64.encode(decoded), bytes);
  }, f.constrainedIdentity<bigint>());
});

Deno.test("U128s", () => {
  f.visitFixtures(f.fixtures.u128_, (bytes, decoded) => {
    asserts.assertEquals(s.u128.decode(bytes), decoded);
    asserts.assertEquals(s.u128.encode(decoded), bytes);
  }, f.constrainedIdentity<bigint>());
});

Deno.test("I128s", () => {
  f.visitFixtures(f.fixtures.i128_, (bytes, decoded) => {
    asserts.assertEquals(s.i128.decode(bytes), decoded);
    asserts.assertEquals(s.i128.encode(decoded), bytes);
  }, f.constrainedIdentity<bigint>());
});
