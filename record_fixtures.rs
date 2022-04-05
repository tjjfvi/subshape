use {
  crate::{make_fixture_getter, stringify},
  parity_scale_codec::Encode,
  serde::Serialize,
};

#[derive(Encode, Serialize)]
struct Person {
  pub name: String,
  #[serde(rename = "nickName")]
  pub nick_name: String,
  #[serde(rename = "superPower")]
  pub super_power: Option<String>,
  #[serde(rename = "luckyNumber")]
  pub lucky_number: u8,
}
make_fixture_getter! {
  record,
  stringify,
  Person {
    name: "Darrel".to_string(),
    nick_name: "The Durst".to_string(),
    super_power: Some("telekinesis".to_string()),
    lucky_number: 9
  },
  Person {
    name: "Michael".to_string(),
    nick_name: "Mike".to_string(),
    super_power: None,
    lucky_number: 7 // Cummon... be more predictable!
  }
}
