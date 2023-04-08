#![allow(non_snake_case)]

use itertools::Itertools;
use std::{fs, path::Path};

#[path = "./codecs/fixtures/array.rs"]
pub mod array_fixtures;

#[path = "./codecs/fixtures/bool.rs"]
pub mod bool_fixtures;

#[path = "./codecs/fixtures/compact.rs"]
pub mod compact_fixtures;

#[path = "./codecs/fixtures/deferred.rs"]
pub mod deferred_fixtures;

#[path = "./codecs/fixtures/float.rs"]
pub mod float_fixtures;

#[path = "./codecs/fixtures/hex.rs"]
pub mod hex_fixtures;

#[path = "./codecs/fixtures/int.rs"]
pub mod int_fixtures;

#[path = "./codecs/fixtures/iterable.rs"]
pub mod iterable_fixtures;

#[path = "./codecs/fixtures/lenPrefixed.rs"]
pub mod len_prefixed_fixtures;

#[path = "./codecs/fixtures/never.rs"]
pub mod never_fixtures;

#[path = "./codecs/fixtures/option.rs"]
pub mod option_fixtures;

#[path = "./codecs/fixtures/optionBool.rs"]
pub mod option_bool_fixtures;

#[path = "./codecs/fixtures/object.rs"]
pub mod object_fixtures;

#[path = "./codecs/fixtures/result.rs"]
pub mod result_fixtures;

#[path = "./codecs/fixtures/str.rs"]
pub mod str_fixtures;

#[path = "./codecs/fixtures/tuple.rs"]
pub mod tuple_fixtures;

#[path = "./codecs/fixtures/union.rs"]
pub mod union_fixtures;

#[path = "./codecs/fixtures/bitSequence.rs"]
pub mod bit_sequence;

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
  let name = Path::new(path)
    .file_name()
    .unwrap()
    .to_str()
    .unwrap()
    .split(".")
    .next()
    .unwrap();
  let snapshot = fs::read_to_string(
    Path::new(path)
      .parent()
      .unwrap()
      .parent()
      .unwrap()
      .join("./test/__snapshots__/".to_string() + name + ".test.ts.snap"),
  )
  .unwrap();
  let entries: Vec<(&str, Vec<u8>)> = snapshot
    .split('`')
    .skip(1)
    .step_by(2)
    .tuples::<(_, _)>()
    .filter(|(_, v)| !v.contains("Error:"))
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
