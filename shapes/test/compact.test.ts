import * as $ from "../../mod.ts"
import { testInvalid, testShape } from "../../test-util.ts"

testShape($.compact($.u32), [0, 1, 6, 8, 14, 16, 30, 32].map((x) => (2 ** x) - 1))
testShape($.compact($.u256), [0, 6, 14, 30, 40, 64, 128, 128, 256].map((x) => (1n << BigInt(x)) - 1n))

testShape($.compact($.tuple($.u32)), [[123]])
testShape($.compact($.field("foo", $.u32)), [{ foo: 456 }])
testShape($.compact($.object($.field("foo", $.u32))), [{ foo: 456 }])

testInvalid($.compact($.u8), [
  null,
  undefined,
  -1,
  256,
])

testInvalid($.compact($.u128), [
  null,
  undefined,
  -1,
  100000000000000000000000000000000000000000000000000000000n,
])

testInvalid($.compact($.tuple($.u32)), [
  null,
  undefined,
  [],
  [-1],
  [123n],
  [Number.MAX_SAFE_INTEGER],
])

testInvalid($.compact($.field("foo", $.u32)), [
  null,
  undefined,
  {},
  { foo: -1 },
  { foo: 123n },
  { foo: Number.MAX_SAFE_INTEGER },
])
