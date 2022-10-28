use parity_scale_codec::Encode;

#[derive(Encode)]
enum Foo {
  A,
  B(u8),
}

#[derive(Encode)]
struct Bar(u8);

#[derive(Encode)]
struct Foobar(Foo, Bar);

#[rustfmt::skip]
crate::fixtures!(
  Foobar(Foo::A, Bar(123)),
  Foobar(Foo::B(0), Bar(123)),
);
