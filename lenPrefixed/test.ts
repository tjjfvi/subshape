import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

testCodec("lenPrefixed(dummy(null))", $.lenPrefixed($.dummy(null)), [null]);

testCodec("lenPrefixed(array(compactU32))", $.lenPrefixed($.array($.compactU32)), {
  empty: [],
  primes: [2, 3, 5, 7, 11, 13, 17, 23, 29],
  squares: [...Array(1000)].map((_, i) => i ** 2),
});

testCodec("lenPrefixed(promise(compactU32))", $.lenPrefixed($.promise($.compactU32)), {
  123: () => new Promise((r) => setTimeout(() => r(123), 100)),
}, true);
