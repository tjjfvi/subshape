#[allow(unused_imports)]
use parity_scale_codec::Compact;

crate::fixtures!(
  Compact(0u8),
  Compact(u8::MAX),
  Compact(u16::MAX),
  Compact(u32::MAX),
  Compact(u64::MAX),
  Compact(u128::MAX),
);
