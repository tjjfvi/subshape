use primitive_types::U256;

macro_rules! int_fixtures {
    ($($uN:ident),*;$($iN:ident),*;($($x:tt)*)) => {
        crate::fixtures!(
          $(
            $uN::from(0u8),
            $uN::from(1u8),
            ($uN::from(1u8) << (std::mem::size_of::<$uN>() * 8 / 2)) - 1,
            $uN::MAX,
          )*
          $(
            $iN::MIN,
            (-1 as $iN) << (std::mem::size_of::<$iN>() * 8 / 2 - 1),
            -1 as $iN,
            0 as $iN,
            1 as $iN,
            ((1 as $iN) << (std::mem::size_of::<$iN>() * 8 / 2 - 1)) - 1,
            $iN::MAX,
          )*
          $($x)*
        );
    };
}

int_fixtures!(u8, u16, u32, u64, u128, U256; i8, i16, i32, i64, i128; (
  // An additional check that the i256 array format is correct
  [0, i64::MIN],  [i64::MIN, -1],  [-1, -1i64],  [0, 0i64],  [1, 0i64],  [i64::MAX, 0],  [-1, i64::MAX],
  // Because there is no i256, we have to simulate it with two i128s
  [0, i128::MIN], [i128::MIN, -1], [-1, -1i128], [0, 0i128], [1, 0i128], [i128::MAX, 0], [-1, i128::MAX],
));
