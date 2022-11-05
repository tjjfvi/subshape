use parity_scale_codec::{Compact, CompactAs, Decode, Encode};

macro_rules! n {
  ($x:literal $t:ty) => {
    Compact::<$t>((1 << ($x - 1)) - 1 + (1 << ($x - 1)))
  };
}

#[derive(Encode, Decode, CompactAs)]
struct A(u32);

#[derive(Encode, Decode, CompactAs)]
struct B {
  foo: u32,
}

crate::fixtures!(
  Compact(0u8),
  n!(1 u8),
  n!(6 u8),
  n!(8 u8),
  n!(14 u16),
  n!(16 u16),
  n!(30 u32),
  n!(32 u32),
  Compact(0u128),
  n!(6 u128),
  n!(14 u128),
  n!(30 u128),
  n!(40 u128),
  n!(64 u128),
  n!(128 u128),
  ((12 << 2) | 0b11u8, u64::MAX, u64::MAX),
  ((28 << 2) | 0b11u8, u128::MAX, u128::MAX),
  Compact(A(123)),
  Compact(B { foo: 456 }),
);
