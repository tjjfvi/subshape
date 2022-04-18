use crate::{make_fixture_getter, stringify, LIPSUM};

make_fixture_getter!(
  tuple,
  stringify,
  ("HELLO!", 1u8, LIPSUM, u32::MAX),
  ("GOODBYE!", 2i16, Some(101u16)),
);
