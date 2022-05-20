use parity_scale_codec::Encode;

#[derive(Encode)]
enum Never {}

crate::fixtures!(None as Option<Never>);
