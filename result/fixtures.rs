use {crate::stringify, parity_scale_codec::Encode, serde::Serialize};

#[derive(Serialize, Encode)]
struct X {
  x: String,
}

make_fixture_getter!(
  result,
  stringify,
  <Result<String, String>>::Ok(String::from("A")),
  <Result<String, String>>::Ok(String::from("B")),
  <Result<String, String>>::Ok(String::from("C")),
  <Result<String, String>>::Err(String::from("A")),
  <Result<String, String>>::Err(String::from("B")),
  <Result<String, String>>::Err(String::from("C")),
  <Result<String, (String, String)>>::Err((String::from("C"), String::from("C"))),
  <Result<String, X>>::Err(X { x: "HELLO".to_string() }),
);
