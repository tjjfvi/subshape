import * as $ from "../../mod.ts"
import { benchShape } from "../../test-util.ts"

function arr<T>(length: number, el: (i: number) => T): T[] {
  return Array.from({ length }, (_, i) => el(i))
}

benchShape("bool[0]", $.array($.bool), [])
benchShape("u128[0]", $.array($.u128), [])
benchShape("compactU256[0]", $.array($.compact($.u256)), [])

benchShape("bool[128]", $.array($.bool), arr(128, (i) => i % 2 === 0))
benchShape("u128[128]", $.array($.u128), arr(128, (i) => 2n ** BigInt(i % 100) + BigInt(i)))
benchShape("compactU256[128]", $.array($.compact($.u256)), arr(128, (i) => 2n ** BigInt(i % 100) + BigInt(i)))

benchShape("bool[16384]", $.array($.bool), arr(16384, (i) => i % 2 === 0))
benchShape("u128[16384]", $.array($.u128), arr(16384, (i) => 2n ** BigInt(i % 100) + BigInt(i)))
benchShape("compactU256[16384]", $.array($.compact($.u256)), arr(16384, (i) => 2n ** BigInt(i % 100) + BigInt(i)))
