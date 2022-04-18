use {
  js_sys::{Array, Uint8Array},
  parity_scale_codec::Encode,
  wasm_bindgen::{prelude::wasm_bindgen, JsError, JsValue},
};

struct ArrayFixtureGroup<T, const N: usize>([T; N]);
impl<T, const N: usize> ArrayFixtureGroup<T, N>
where
  wasm_bindgen::JsValue: From<T>,
  T: Encode,
  T: Clone,
{
  fn to_js_arrays(self) -> Array {
    let all = Array::new();

    let decoded = Array::new();
    for d in self.0.clone() {
      decoded.push(&JsValue::from(d));
    }
    all.push(&decoded);

    let encoded = Uint8Array::from(&Encode::encode(&Vec::from(self.0.clone()))[..]);
    all.push(&encoded);

    let sizedEncoded = Uint8Array::from(&Encode::encode(&self.0)[..]);
    all.push(&sizedEncoded);

    all
  }
}

#[wasm_bindgen]
pub fn array_() -> Result<Array, JsError> {
  console_error_panic_hook::set_once();
  let a = Array::new();
  // TODO: arrays of differently-typed elements
  a.push(&ArrayFixtureGroup([1i8, 2i8, 3i8, 4i8, 5i8]).to_js_arrays());
  a.push(&ArrayFixtureGroup([6i8, 7i8, 8i8, 9i8, 10i8]).to_js_arrays());
  a.push(&ArrayFixtureGroup([11i8, 12i8, 13i8, 14i8, 15i8]).to_js_arrays());
  a.push(&ArrayFixtureGroup([16i8, 17i8, 18i8, 19i8, 20i8, 21i8]).to_js_arrays());
  Ok(a)
}
