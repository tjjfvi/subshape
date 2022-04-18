use {
  crate::{make_fixture_getter, stringify},
  parity_scale_codec::Encode,
  serde::Serialize,
};

#[derive(Encode, Serialize)]
enum Abc {
  A,
  B(String),
  C(u32, u64),
  D { a: u32, b: u64 },
}
make_fixture_getter!(
  tagged_union,
  stringify,
  Abc::A,
  Abc::B("HELLO".to_string()),
  Abc::C(255, 101010101),
  Abc::D { a: 101, b: 999 }
);
