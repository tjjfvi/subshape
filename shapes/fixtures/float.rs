fn f(v: f64) -> u64 {
  v.to_bits()
}

crate::fixtures!(
  f(0.0),
  f(1.0),
  f(-1.0),
  f(1.2345),
  f(1.0e23),
  f(4.0e-56),
  f(2.0_f64.powi(53) - 1.0),
  f(-(2.0_f64.powi(53) - 1.0)),
  f(f64::MAX),
  f(f64::MIN),
  f(f64::NAN),
  f(f64::NEG_INFINITY),
  f(f64::INFINITY),
);
