import * as $ from "../../mod.ts"
import { benchShape } from "../../test-util.ts"

// for comparison
benchShape("u128", $.u128, 123n)

benchShape("{}", $.object(), {})
benchShape("{ x: u128 }", $.field("x", $.u128), { x: 123n })
benchShape(
  "{ x: u128, y: u128 }",
  $.object($.field("x", $.u128), $.field("y", $.u128)),
  { x: 123n, y: 456n },
)
benchShape(
  "{ x: u128, y: u128, z: u128 }",
  $.object($.field("x", $.u128), $.field("y", $.u128), $.field("z", $.u128)),
  { x: 123n, y: 456n, z: 789n },
)

benchShape(
  "Array<{ x: u128, y: u128, z: u128 }>",
  $.array($.object($.field("x", $.u128), $.field("y", $.u128), $.field("z", $.u128))),
  Array.from(
    { length: 1000 },
    (_, i) => ({ x: BigInt(i), y: BigInt(i) ** 2n, z: BigInt(i) ** 3n }),
  ),
)

const longKey =
  "thisIsTheKeyThatNeverEnds_itJustGoesRoundAndRoundMyFriends_somePeopleStartedWritingIt_notKnowingWhatItWas_andWeContinueWritingItForeverJustBecause_"
    .repeat(1000)

benchShape("{ [longKey]: u128 }", $.object($.field(longKey, $.u128)), { [longKey]: 123n })
