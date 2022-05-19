use parity_scale_codec::OptionBool;

crate::fixtures!(
  OptionBool(None),
  OptionBool(Some(true)),
  OptionBool(Some(false)),
);
