import * as $ from "../../mod.ts";
import { benchCodec } from "../../test-util.ts";

function arr<T>(length: number, el: (i: number) => T): T[] {
  return Array.from({ length }, (_, i) => el(i));
}

benchCodec("bool[0]", $.array($.bool), []);
benchCodec("u128[0]", $.array($.u128), []);
benchCodec("compactU256[0]", $.array($.compact($.u256)), []);

benchCodec("bool[128]", $.array($.bool), arr(128, (i) => i % 2 === 0));
benchCodec("u128[128]", $.array($.u128), arr(128, (i) => 2n ** BigInt(i % 100) + BigInt(i)));
benchCodec("compactU256[128]", $.array($.compact($.u256)), arr(128, (i) => 2n ** BigInt(i % 100) + BigInt(i)));

benchCodec("bool[16384]", $.array($.bool), arr(16384, (i) => i % 2 === 0));
benchCodec("u128[16384]", $.array($.u128), arr(16384, (i) => 2n ** BigInt(i % 100) + BigInt(i)));
benchCodec("compactU256[16384]", $.array($.compact($.u256)), arr(16384, (i) => 2n ** BigInt(i % 100) + BigInt(i)));
