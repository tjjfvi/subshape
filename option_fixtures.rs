crate::make_fixture_getter!(
  option,
  crate::stringify,
  Some("HELLO!"),
  Some(1u8),
  Some(crate::LIPSUM),
  Some(u32::MAX),
  None as Option<()>
);
