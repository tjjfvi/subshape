use std::collections::{BTreeMap, BTreeSet};

crate::fixtures!(
  [].into_iter().collect::<BTreeSet<u8>>(),
  [0, 2, 4, 8].into_iter().collect::<BTreeSet<u8>>(),
  [2, 3, 5, 7].into_iter().collect::<BTreeSet<u8>>(),
  [].into_iter().collect::<BTreeMap<&str, u8>>(),
  [("0", 0), ("1", 1)]
    .into_iter()
    .collect::<BTreeMap<&str, u8>>(),
  [("2^0", 0), ("2^1", 2), ("2^2", 4), ("2^3", 8), ("2^4", 16)]
    .into_iter()
    .collect::<BTreeMap<&str, u8>>(),
);
