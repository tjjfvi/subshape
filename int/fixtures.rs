macro_rules! make_number_fixture_getter {
  ($t:ty, $($val:expr),* $(,)?) => { paste::paste! {
    crate::make_fixture_getter!([<$t>], js_sys::Number::from, $t::MIN, $t::MAX$(, $val)*);
  }};
}
make_number_fixture_getter!(u8, 0u8, 1u8, 2u8, 9u8);
make_number_fixture_getter!(i8, -9i8, -2i8, -1i8, 0i8, 1i8, 2i8, 9i8);
make_number_fixture_getter!(u16, 0u16, 1u16, 2u16, 9u16);
make_number_fixture_getter!(i16, -9i16, -2i16, -1i16);
make_number_fixture_getter!(u32, 0u32, 1u32, 2u32, 9u32);
make_number_fixture_getter!(i32, -9i32, -2i32, -1i32);

macro_rules! make_bigint_fixture_getter {
  ($t:ty, $($val:expr),* $(,)?) => { paste::paste! {
    crate::make_fixture_getter!([<$t>], js_sys::BigInt::from, $t::MIN, $t::MAX$(, $val)*);
  }};
}
make_bigint_fixture_getter!(u64, 0u64, 1u64, 2u64, 9u64);
make_bigint_fixture_getter!(i64, -9i64, -2i64, -1i64);
make_bigint_fixture_getter!(u128, 0u128, 1u128, 2u128, 9u128);
make_bigint_fixture_getter!(i128, -9i128, -2i128, -1i128);
