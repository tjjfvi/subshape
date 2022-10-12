use parity_scale_codec::{Compact, Encode};

crate::fixtures!(
  ().encode(),
  <Vec<Compact<u32>>>::new().encode(),
  [2, 3, 5, 7, 11, 13, 17, 23, 29u32]
    .into_iter()
    .map(Compact)
    .collect::<Vec<_>>()
    .encode(),
  (0..1000u32)
    .map(|x| x * x)
    .map(Compact)
    .collect::<Vec<_>>()
    .encode(),
  Compact(123u32).encode(),
);
