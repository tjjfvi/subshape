// import * as $ from "https://deno.land/x/scale/mod.ts";
import * as $ from "../mod.ts"

const visitor = new $.CodecVisitor<string>()

// you can pass a plain codec:
visitor.add($.u8, () => "$.u8")

// or a codec factory:
visitor.add($.int, (_codec, signed, size) => `$.int(${signed}, ${size})`)
//                          ^^^^^^^^^^^^
//          the arguments that were passed to the factory

// you can handle generic factories like so:
visitor.generic(<T>() => {
  visitor.add($.array<T>, (_, $el) => `$.array(${visitor.visit($el)})`)
  //                          ^^^ Codec<T>
})

// if none of the other visitors match:
visitor.fallback((_codec) => "?")

visitor.visit($.array($.u8)) // "$.array($.u8)"
visitor.visit($.u16) // "$.int(false, 16)"
visitor.visit($.array($.str)) // "$.array(?)"
