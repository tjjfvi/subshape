use {
  crate::make_fixture_getter,
  js_sys::{BigInt, Number},
  parity_scale_codec::Compact,
  paste::paste,
};

macro_rules! x_from_compact {
  ($n:expr, $t:ident) => {
    paste! {
      fn [<$n _from_compact>]<T>(compact: Compact<T>) -> $t
      where $t: From<T> {
        $t::from(compact.0)
      }
    }
  };
}

x_from_compact!(bigint, BigInt);
make_fixture_getter!(
  bigint_compact,
  bigint_from_compact,
  Compact(u128::MIN),
  Compact(u64::MIN),
  Compact(u64::MAX),
  Compact(u128::MAX)
);

x_from_compact!(number, Number);
make_fixture_getter!(
  number_compact,
  number_from_compact,
  Compact(u16::MIN),
  Compact(u8::MIN),
  Compact(u8::MAX),
  Compact(u16::MAX)
);
