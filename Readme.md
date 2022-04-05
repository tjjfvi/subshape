# SCALE

- JavaScript-idiomatic shapes
- 1st class type-safety
- Robust! Tested against the Rust implementation
- Encoders/decoders are decoupled

## Example

```ts
// TODO: actually release!
import * as s from "https://deno.land/x/scale/mod.ts";

const decoder = new s.RecordDecoder(
  new s.RecordFieldDecoder("name", s.strDecoder),
  new s.RecordFieldDecoder("nickName", s.strDecoder),
  new s.RecordFieldDecoder("superPower", new s.OptionDecoder(s.strDecoder)),
);

asserts.assertEquals(decoder.decode(bytes), {
  name: "Magdalena",
  nickName: "Magz",
  superPower: "Hydrokinesis",
});
```
