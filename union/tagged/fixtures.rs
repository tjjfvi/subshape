use parity_scale_codec::Encode;

#[derive(Encode)]
enum Abc {
  A,
  B(String),
  C(u32, u64),
  D { a: u32, b: u64 },
}

crate::fixtures!(
  Abc::A,
  Abc::B("HELLO".to_string()),
  Abc::C(255, 101010101),
  Abc::D { a: 101, b: 999 }
);
