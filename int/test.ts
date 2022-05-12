import * as asserts from "std/testing/asserts.ts";
import * as $ from "../mod.ts";
import * as f from "../test-util.ts";

Deno.test("U8s", () => {
  f.visitFixtures(f.fixtures.u8_, (bytes, decoded) => {
    asserts.assertEquals($.u8.decode(bytes), decoded);
    asserts.assertEquals($.u8.encode(decoded), bytes);
  }, f.constrainedIdentity<number>());
});

Deno.test("I8s", () => {
  f.visitFixtures(f.fixtures.i8_, (bytes, decoded) => {
    asserts.assertEquals($.i8.decode(bytes), decoded);
    asserts.assertEquals($.i8.encode(decoded), bytes);
  }, f.constrainedIdentity<number>());
});

Deno.test("U16s", () => {
  f.visitFixtures(f.fixtures.u16_, (bytes, decoded) => {
    asserts.assertEquals($.u16.decode(bytes), decoded);
    asserts.assertEquals($.u16.encode(decoded), bytes);
  }, f.constrainedIdentity<number>());
});

Deno.test("I16s", () => {
  f.visitFixtures(f.fixtures.i16_, (bytes, decoded) => {
    asserts.assertEquals($.i16.decode(bytes), decoded);
    asserts.assertEquals($.i16.encode(decoded), bytes);
  }, f.constrainedIdentity<number>());
});

Deno.test("U32s", () => {
  f.visitFixtures(f.fixtures.u32_, (bytes, decoded) => {
    asserts.assertEquals($.u32.decode(bytes), decoded);
    asserts.assertEquals($.u32.encode(decoded), bytes);
  }, f.constrainedIdentity<number>());
});

Deno.test("I32s", () => {
  f.visitFixtures(f.fixtures.i32_, (bytes, decoded) => {
    asserts.assertEquals($.i32.decode(bytes), decoded);
    asserts.assertEquals($.i32.encode(decoded), bytes);
  }, f.constrainedIdentity<number>());
});

Deno.test("U64s", () => {
  f.visitFixtures(f.fixtures.u64_, (bytes, decoded) => {
    asserts.assertEquals($.u64.decode(bytes), decoded);
    asserts.assertEquals($.u64.encode(decoded), bytes);
  }, f.constrainedIdentity<bigint>());
});

Deno.test("I64s", () => {
  f.visitFixtures(f.fixtures.i64_, (bytes, decoded) => {
    asserts.assertEquals($.i64.decode(bytes), decoded);
    asserts.assertEquals($.i64.encode(decoded), bytes);
  }, f.constrainedIdentity<bigint>());
});

Deno.test("U128s", () => {
  f.visitFixtures(f.fixtures.u128_, (bytes, decoded) => {
    asserts.assertEquals($.u128.decode(bytes), decoded);
    asserts.assertEquals($.u128.encode(decoded), bytes);
  }, f.constrainedIdentity<bigint>());
});

Deno.test("I128s", () => {
  f.visitFixtures(f.fixtures.i128_, (bytes, decoded) => {
    asserts.assertEquals($.i128.decode(bytes), decoded);
    asserts.assertEquals($.i128.encode(decoded), bytes);
  }, f.constrainedIdentity<bigint>());
});
