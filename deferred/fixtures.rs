use parity_scale_codec::Encode;

#[derive(Encode)]
struct LinkedList(Option<(u8, Box<LinkedList>)>);

crate::fixtures!(
  LinkedList(None),
  LinkedList(Some((1, Box::new(LinkedList(None))))),
  LinkedList(Some((
    1,
    Box::new(LinkedList(Some((
      2,
      Box::new(LinkedList(Some((3, Box::new(LinkedList(None))))))
    ))))
  ))),
);
