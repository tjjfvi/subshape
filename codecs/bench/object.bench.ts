import * as $ from "../../mod.ts"
import { benchCodec } from "../../test-util.ts"

// for comparison
benchCodec("u128", $.u128, 123n)

benchCodec("{}", $.object(), {})
benchCodec("{ x: u128 }", $.object(["x", $.u128]), { x: 123n })
benchCodec(
  "{ x: u128, y: u128 }",
  $.object(["x", $.u128], ["y", $.u128]),
  { x: 123n, y: 456n },
)
benchCodec(
  "{ x: u128, y: u128, z: u128 }",
  $.object(["x", $.u128], ["y", $.u128], ["z", $.u128]),
  { x: 123n, y: 456n, z: 789n },
)

const longKey =
  "thisIsTheKeyThatNeverEnds_itJustGoesRoundAndRoundMyFriends_somePeopleStartedWritingIt_notKnowingWhatItWas_andWeContinueWritingItForeverJustBecause_"
    .repeat(1000)

benchCodec("{ [longKey]: u128 }", $.object([longKey, $.u128]), { [longKey]: 123n })
