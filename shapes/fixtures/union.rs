use parity_scale_codec::Encode;

#[derive(Encode)]
enum Abc {
  A,
  B(String),
  C(u32, u64),
  D { a: u32, b: u64 },
}

#[derive(Encode)]
enum Name {
  Ross,
  Alisa,
  Stefan,
  Raoul,
  James,
  David,
  Pierre,
}

#[derive(Encode)]
enum InterestingU8s {
  #[codec(index = 0)]
  Min = 0,
  #[codec(index = 1)]
  Unit = 1,
  #[codec(index = 2)]
  EvenPrime = 2,
  #[codec(index = 28)]
  LargestPerfect = 28,
  #[codec(index = 129)]
  FirstUninteresting = 129,
  #[codec(index = 225)]
  LargestSquare = 225,
  #[codec(index = 255)]
  Max = 255,
}

crate::fixtures!(
  Abc::A,
  Abc::B("HELLO".to_string()),
  Abc::C(255, 101010101),
  Abc::D { a: 101, b: 999 },
  Name::Ross,
  Name::Alisa,
  Name::Stefan,
  Name::Raoul,
  Name::James,
  Name::David,
  Name::Pierre,
  InterestingU8s::Min,
  InterestingU8s::Unit,
  InterestingU8s::EvenPrime,
  InterestingU8s::LargestPerfect,
  InterestingU8s::FirstUninteresting,
  InterestingU8s::LargestSquare,
  InterestingU8s::Max,
);
