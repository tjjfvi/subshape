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
    readonly props: {
      a: string;
      b: string;
    },
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
    // return new TwoElTupleErr(...deserialized.Err as [any, any]);
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
        const c = new s.Result(undefined as any, s.str);
        asserts.assertEquals(c.decode(bytes), normalized);
        asserts.assertEquals(c.encode(normalized as any), bytes);
        break;
      }
      case 3:
      case 4:
      case 5: {
        // TODO
        break;
      }
      case 6: {
        // console.log(normalized);
        // const c = new s.Result(
        //   new s.Err(
        //     TwoElTupleErr,
        //     new s.Record(
        //       new s.RecordField("a", s.str),
        //       new s.RecordField("b", s.str),
        //     ),
        //   ),
        //   undefined as any,
        // );
        // TODO
        // asserts.assertEquals(
        //
        //   normalized,
        // );
        // asserts.assertEquals(
        //   new s.ResultEncoder(
        //     undefined as any,
        //     new s.ErrorEncoder(
        //       new s.RecordFieldEncoder("a", s.strEncoder),
        //       new s.RecordFieldEncoder("b", s.strEncoder),
        //     ),
        //   ).encode(normalized as any),
        //   bytes,
        // );
        break;
      }
      case 7: {
        // TODO
        // asserts.assertEquals(
        //   new s.ResultDecoder(
        //     undefined as any,
        //     RecErr,
        //     new s.RecordDecoder(new s.RecordFieldDecoder("x", s.strDecoder)),
        //   ).decode(bytes),
        //   normalized,
        // );
        // asserts.assertEquals(
        //   new s.ResultEncoder(
        //     undefined as any,
        //     new s.ErrorEncoder(
        //       new s.RecordFieldEncoder("a", new s.RecordEncoder(new s.RecordFieldEncoder("x", s.strEncoder))),
        //     ),
        //   ).encode(normalized as any),
        //   bytes,
        // );
        break;
      }
    }
  });
});
