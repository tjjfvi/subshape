import * as asserts from "std/testing/asserts.ts";
import * as s from "./mod.ts";
import { fixtures, visitFixtures } from "./test-util.ts";

class ErrFromTuple extends Error {
  constructor(
    readonly a: string,
    readonly b: string,
  ) {
    super();
  }
}

class ErrFromObj extends Error {
  constructor(
    readonly data: {
      x: string;
    },
  ) {
    super();
  }
}

class ErrFromValue extends Error {
  constructor(readonly value: any) {
    super();
  }
}

Deno.test("Results", () => {
  visitFixtures(fixtures.result_, (bytes, decoded, i) => {
    switch (i) {
      case 0:
      case 1:
      case 2: {
        const c = s.result(s.record(["value", s.str]), undefined as any);
        asserts.assertEquals(c.decode(bytes), decoded);
        asserts.assertEquals(c.encode(decoded as any), bytes);
        break;
      }
      case 3:
      case 4:
      case 5: {
        const c = s.result(undefined as any, s.instance(ErrFromValue, ["value", s.str]));
        const d = c.decode(bytes);
        asserts.assert(d instanceof ErrFromValue);
        asserts.assertEquals(d.value, (decoded as ErrFromValue).value);
        asserts.assertEquals(c.encode(decoded), bytes);
        break;
      }
      case 6: {
        const c = s.result(undefined as any, s.instance(ErrFromTuple, ["a", s.str], ["b", s.str]));
        const d = c.decode(bytes);
        asserts.assert(d instanceof ErrFromTuple);
        asserts.assertEquals(d.a, (decoded as any).a);
        asserts.assertEquals(d.b, (decoded as any).b);
        break;
      }
      case 7: {
        const c = s.result(undefined as any, s.instance(ErrFromObj, ["data", s.record(["x", s.str])]));
        const d = c.decode(bytes);
        asserts.assert(d instanceof ErrFromObj);
        asserts.assertEquals(d.data, (decoded as ErrFromObj).data);
        asserts.assertEquals(c.encode(decoded), bytes);
        break;
      }
    }
  }, (raw: string) => {
    const deserialized = JSON.parse(raw);
    const key = Object.keys(deserialized)[0]!;
    if (key === "Ok") {
      return {
        value: deserialized.Ok,
      };
    }
    if (Array.isArray(deserialized.Err)) {
      return new ErrFromTuple(...deserialized.Err as [string, string]);
    }
    if (typeof deserialized.Err === "object") {
      return new ErrFromObj(deserialized.Err);
    }
    return new ErrFromValue(deserialized.Err);
  });
});
