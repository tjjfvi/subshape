import * as asserts from "std/testing/asserts.ts";
import * as s from "./mod.ts";
import { fixtures, visitFixtures } from "./test-util.ts";

class Ok<T> implements s.OkBearer<T> {
  constructor(readonly ok: T) {}
}

class Err extends Error {
  constructor(readonly data: any) {
    super();
  }
}

Deno.test("Results", () => {
  visitFixtures(fixtures.result_, (bytes, decoded, i) => {
    switch (i) {
      case 0:
      case 1:
      case 2: {
        const c = new s.Result(new s.Ok(Ok, s.str), undefined as any);
        asserts.assertEquals(c.decode(bytes), decoded);
        asserts.assertEquals(c.encode(decoded as any), bytes);
        break;
      }
      case 3:
      case 4:
      case 5: {
        const c = new s.Result(
          undefined as any,
          new s.Err(Err, new s.Record(["a", s.str])),
        );
        const d = c.decode(bytes);
        asserts.assert(d instanceof Err);
        asserts.assertEquals(d.data, (decoded as Err).data);
        asserts.assertEquals(c.encode(decoded), bytes);
        break;
      }
      case 6: {
        const c = new s.Result(
          undefined as any,
          new s.Err(
            Err,
            new s.Record(
              [0, s.str],
              [1, s.str],
            ),
          ),
        );
        const d = c.decode(bytes);
        asserts.assert(d instanceof Err);
        asserts.assertEquals(d.data, (decoded as Err).data);
        asserts.assertEquals(c.encode(decoded), bytes);
        break;
      }
      case 7: {
        const c = new s.Result(
          undefined as any,
          new s.Err(Err, new s.Record(["x", s.str])),
        );
        const d = c.decode(bytes);
        asserts.assert(d instanceof Err);
        asserts.assertEquals(d.data, (decoded as Err).data);
        asserts.assertEquals(c.encode(decoded), bytes);
        break;
      }
    }
  }, (raw: string) => {
    const deserialized = JSON.parse(raw);
    const key = Object.keys(deserialized)[0]!;
    if (key === "Ok") {
      return new Ok(deserialized.Ok);
    }
    if (Array.isArray(deserialized.Err)) {
      return new Err((deserialized.Err as any[]).reduce<Record<number, any>>((acc, cur, i) => {
        return {
          ...acc,
          [i]: cur,
        };
      }, {}));
    }
    if (typeof deserialized.Err === "object") {
      return new Err(deserialized.Err);
    }
    return new Err({ a: deserialized.Err });
  });
});
