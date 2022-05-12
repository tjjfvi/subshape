import * as s from "../mod.ts";
import { benchCodec } from "../test-util.ts";

// for comparison
benchCodec("u128", s.u128, 123n);

benchCodec("{}", s.record(), {});
benchCodec("{ x: u128 }", s.record(["x", s.u128]), { x: 123n });
benchCodec(
  "{ x: u128, y: u128 }",
  s.record(["x", s.u128], ["y", s.u128]),
  { x: 123n, y: 456n },
);
benchCodec(
  "{ x: u128, y: u128, z: u128 }",
  s.record(["x", s.u128], ["y", s.u128], ["z", s.u128]),
  { x: 123n, y: 456n, z: 789n },
);

const longKey =
  "thisIsTheKeyThatNeverEnds_itJustGoesRoundAndRoundMyFriends_somePeopleStartedWritingIt_notKnowingWhatItWas_andWeContinueWritingItForeverJustBecause_"
    .repeat(1000);

benchCodec("{ [longKey]: u128 }", s.record([longKey, s.u128]), { [longKey]: 123n });
