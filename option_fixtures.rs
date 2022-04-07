crate::make_fixture_getter!(
  option,
  crate::stringify,
  Some("HELLO!"),
  Some(1u8),
  Some(crate::LIPSUM),
  Some(u32::MAX),
  None as Option<()>
);

make_fixture_getter!(
  bool_option,
  wasm_bindgen::JsValue::from,
  <Option<bool>>::Some(true),
  <Option<bool>>::Some(false),
  <Option<bool>>::None
);
