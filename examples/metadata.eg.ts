// import * as $ from "https://deno.land/x/scale/mod.ts";
import * as $ from "../mod.ts"

const visitor = new $.ShapeVisitor<string>()

// you can pass a plain shape:
visitor.add($.u8, () => "$.u8")

// or a shape factory:
visitor.add($.int, (_shape, signed, size) => `$.int(${signed}, ${size})`)
//                          ^^^^^^^^^^^^
//          the arguments that were passed to the factory

// you can handle generic factories like so:
visitor.generic(<T>() => {
  visitor.add($.array<T>, (_, $el) => `$.array(${visitor.visit($el)})`)
  //                          ^^^ Shape<T>
})

// if none of the other visitors match:
visitor.fallback((_shape) => "?")

visitor.visit($.array($.u8)) // "$.array($.u8)"
visitor.visit($.u16) // "$.int(false, 16)"
visitor.visit($.array($.str)) // "$.array(?)"
