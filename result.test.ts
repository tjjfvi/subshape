import * as s from "/mod.ts";
import { fixtures, visitFixtures } from "/test-util.ts";
import * as asserts from "std/testing/asserts.ts";

class SingleValueErr extends Error {
  constructor(readonly a: any) {
    super();
  }
}
class TwoElTupleErr extends Error {
  constructor(
    readonly a: any,
    readonly b: any,
  ) {
    super();
  }
}
class RecErr extends Error {
  constructor(readonly a: Record<PropertyKey, any>) {
    super();
  }
}
const normalize = (decoded: string) => {
  const deserialized = JSON.parse(decoded);
  const key = Object.keys(deserialized)[0]!;
  if (key === "Ok") {
    return new s.Ok(deserialized.Ok);
  }
  if (typeof deserialized.Err === "string") {
    return new SingleValueErr(deserialized.Err);
  } else if (Array.isArray(deserialized.Err)) {
    return new TwoElTupleErr(...deserialized.Err as [any, any]);
  }
  return new RecErr(deserialized.Err);
};

Deno.test("Results", () => {
  visitFixtures<string>(fixtures.result_, (bytes, decoded, i) => {
    const normalized = normalize(decoded);
    switch (i) {
      case 0:
      case 1:
      case 2: {
        asserts.assertEquals(new s.ResultDecoder(s.strDecoder, undefined as any).decode(bytes), normalized);
        asserts.assertEquals(new s.ResultEncoder(s.strEncoder, undefined as any).encode(normalized as any), bytes);
        break;
      }
      case 3:
      case 4:
      case 5: {
        asserts.assertEquals(
          new s.ResultDecoder(undefined as any, SingleValueErr, s.strDecoder).decode(bytes),
          normalized,
        );
        asserts.assertEquals(
          new s.ResultEncoder(undefined as any, new s.ErrorEncoder(new s.RecordFieldEncoder("a", s.strEncoder)))
            .encode(normalized as any),
          bytes,
        );
        break;
      }
      case 6: {
        asserts.assertEquals(
          new s.ResultDecoder(undefined as any, TwoElTupleErr, s.strDecoder, s.strDecoder).decode(bytes),
          normalized,
        );
        asserts.assertEquals(
          new s.ResultEncoder(
            undefined as any,
            new s.ErrorEncoder(
              new s.RecordFieldEncoder("a", s.strEncoder),
              new s.RecordFieldEncoder("b", s.strEncoder),
            ),
          ).encode(normalized as any),
          bytes,
        );
        break;
      }
      case 7: {
        asserts.assertEquals(
          new s.ResultDecoder(
            undefined as any,
            RecErr,
            new s.RecordDecoder(new s.RecordFieldDecoder("x", s.strDecoder)),
          ).decode(bytes),
          normalized,
        );
        asserts.assertEquals(
          new s.ResultEncoder(
            undefined as any,
            new s.ErrorEncoder(
              new s.RecordFieldEncoder("a", new s.RecordEncoder(new s.RecordFieldEncoder("x", s.strEncoder))),
            ),
          ).encode(normalized as any),
          bytes,
        );
        break;
      }
    }
  });
});
