#![allow(non_snake_case)]

use {js_sys::JsString, serde::Serialize, wee_alloc::WeeAlloc};

#[global_allocator]
static ALLOC: WeeAlloc = WeeAlloc::INIT;

macro_rules! make_fixture_getter {
  ($t:ident, $js_ty_from:expr, $($val:expr),* $(,)?) => { paste::paste! {
    #[wasm_bindgen::prelude::wasm_bindgen]
    pub fn [<$t _>]() -> Result<js_sys::Map, wasm_bindgen::JsError> {
      console_error_panic_hook::set_once();
      let result = js_sys::Map::new();
      $(result.set(
        &js_sys::Uint8Array::from(&parity_scale_codec::Encode::encode(&($val))[..]),
        &$js_ty_from($val),
      );)*
      return Ok(result);
    }
  }};
}
pub(crate) use make_fixture_getter;

pub(crate) const LIPSUM: &'static str = include_str!("lipsum.txt");
pub(crate) const WORDS: &'static str = include_str!("words.txt");

pub(crate) fn stringify<T>(t: T) -> JsString
where
  T: Serialize,
{
  JsString::from(serde_json::to_string(&t).unwrap())
}

pub mod array_fixtures;
pub mod bool_fixtures;
pub mod compact_fixtures;
pub mod int_fixtures;
pub mod option_fixtures;
pub mod record_fixtures;
pub mod str_fixtures;
pub mod tuple_fixtures;
pub mod union_fixtures;

// // TODO: Results!
// make_fixture_getter!(
//   result,
//   stringify,
//   <Result<String, String>>::Ok(String::from("A")),
//   <Result<String, String>>::Ok(String::from("B")),
//   <Result<String, String>>::Ok(String::from("C")),
//   <Result<String, String>>::Err(String::from("A")),
//   <Result<String, String>>::Err(String::from("B")),
//   <Result<String, String>>::Err(String::from("C")),
// );
