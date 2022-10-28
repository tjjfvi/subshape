use parity_scale_codec::Encode;

#[derive(Encode)]
struct X {
  x: String,
}

crate::fixtures!(
  <Result<String, String>>::Ok(String::from("ok")),
  <Result<String, String>>::Err(String::from("err")),
);
