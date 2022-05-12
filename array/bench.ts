import * as s from "../mod.ts";
import { benchCodec } from "../test-util.ts";

function arr<T>(length: number, el: (i: number) => T): T[] {
  return Array.from({ length }, (_, i) => el(i));
}

benchCodec("bool[0]", s.array(s.bool), []);
benchCodec("u128[0]", s.array(s.u128), []);
benchCodec("compact[0]", s.array(s.compact), []);

benchCodec("bool[128]", s.array(s.bool), arr(128, (i) => i % 2 === 0));
benchCodec("u128[128]", s.array(s.u128), arr(128, (i) => 2n ** BigInt(i % 100) + BigInt(i)));
benchCodec("compact[128]", s.array(s.compact), arr(128, (i) => 2n ** BigInt(i % 100) + BigInt(i)));

benchCodec("bool[16384]", s.array(s.bool), arr(16384, (i) => i % 2 === 0));
benchCodec("u128[16384]", s.array(s.u128), arr(16384, (i) => 2n ** BigInt(i % 100) + BigInt(i)));
benchCodec("compact[16384]", s.array(s.compact), arr(16384, (i) => 2n ** BigInt(i % 100) + BigInt(i)));
