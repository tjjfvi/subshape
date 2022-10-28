use parity_scale_codec::Encode;

#[derive(Encode)]
struct Person {
  pub name: String,
  pub nick_name: String,
  pub super_power: Option<String>,
  pub lucky_number: u8,
}

crate::fixtures!(
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
  },
);
