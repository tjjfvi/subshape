use bitvec::{bitvec, order::Msb0};

crate::fixtures!(
  bitvec![u8, Msb0; ],
  bitvec![u8, Msb0; 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1]
);
