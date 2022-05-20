#![allow(non_snake_case)]

use itertools::Itertools;
use std::{fs, path::Path};

#[path = "./array/fixtures.rs"]
pub mod array_fixtures;

#[path = "./bool/fixtures.rs"]
pub mod bool_fixtures;

#[path = "./compact/fixtures.rs"]
pub mod compact_fixtures;

#[path = "./int/fixtures.rs"]
pub mod int_fixtures;

#[path = "./iterable/fixtures.rs"]
pub mod iterable_fixtures;

#[path = "./never/fixtures.rs"]
pub mod never_fixtures;

#[path = "./option/fixtures.rs"]
pub mod option_fixtures;

#[path = "./option/optionBool/fixtures.rs"]
pub mod option_bool_fixtures;

#[path = "./object/fixtures.rs"]
pub mod object_fixtures;

#[path = "./result/fixtures.rs"]
pub mod result_fixtures;

#[path = "./str/fixtures.rs"]
pub mod str_fixtures;

#[path = "./tuple/fixtures.rs"]
pub mod tuple_fixtures;

#[path = "./union/fixtures.rs"]
pub mod union_fixtures;

pub(crate) const LIPSUM: &'static str = include_str!("lipsum.txt");
pub(crate) const WORDS: &'static str = include_str!("words.txt");
pub(crate) const CARGO_LOCK: &'static str = include_str!("Cargo.lock");

#[macro_export]
macro_rules! fixtures {
  ($($expr:expr),+ $(,)?) => {
    #[allow(dead_code)]
    fn _check_fixtures(){
      crate::test_fixtures(file!(), vec![$((stringify!($expr), parity_scale_codec::Encode::encode(&$expr))),+])
    }
    #[test]
    fn check_fixtures(){
      _check_fixtures()
    }
  }
}

pub(crate) fn test_fixtures(
  path: &'static str,
  values: Vec<(&'static str, Vec<u8>)>,
) {
  let snapshot = fs::read_to_string(
    Path::new(path)
      .parent()
      .unwrap()
      .join("./__snapshots__/test.ts.snap"),
  )
  .unwrap();
  let entries: Vec<(&str, Vec<u8>)> = snapshot
    .split('`')
    .skip(1)
    .step_by(2)
    .tuples::<(_, _)>()
    .map(|(k, v)| {
      (
        k,
        v.trim()
          .split('\n')
          .map(|s| u8::from_str_radix(s, 16).unwrap())
          .collect(),
      )
    })
    .collect();
  assert_eq!(entries.len(), values.len(), "count mismatch");
  for ((key1, expected), (key2, actual)) in entries.iter().zip(values.iter()) {
    assert_eq!(expected, actual, "{} / {}", key1, key2);
  }
}
