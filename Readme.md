# subShape &nbsp;<sub><sup>composable shapes for cohesive code</sup></sub>

> ### *one shape can do them all; one shape defined them*

subShape provides primitives and patterns for crafting composable shapes
featuring cohesive typing, validation, serialization, and reflection.

## Setup

### Deno

```ts
import * as $ from "https://deno.land/x/subshape/mod.ts"
```

### Node

```
npm install subshape
```

```ts
import * as $ from "subshape"
```

## Demo

### Craft a Composable Shape

```ts
import * as $ from "https://deno.land/x/subshape/mod.ts"

const $superhero = $.object(
  $.field("pseudonym", $.str),
  $.optionalField("secretIdentity", $.str),
  $.field("superpowers", $.array($.str)),
)
```

### And Get...

#### Typing

```ts
type Superhero = $.Output<typeof $superhero>
// type Superhero = {
//   pseudonym: string;
//   secretIdentity?: string | undefined;
//   superpowers: string[];
// }
```

#### Validation

```ts
const spiderMan = {
  pseudonym: "Spider-Man",
  secretIdentity: "Peter Parker",
  superpowers: ["does whatever a spider can"],
}

$.assert($superhero, spiderMan) // ok!

const bob = {
  pseudonym: "Bob",
  secretIdentity: "Robert",
  superpowers: null,
}

$.assert($superhero, bob) // ShapeAssertError: !(value.superpowers instanceof Array)
```

#### Serialization

```ts
const encoded = $superhero.encode(spiderMan)
// encoded: Uint8Array

const decoded = $superhero.decode(encoded)
// decoded: Superhero

console.log(decoded)
// Prints:
//   {
//     pseudonym: "Spider-Man",
//     secretIdentity: "Peter Parker",
//     superpowers: [ "does whatever a spider can" ]
//   }
```

#### Reflection

```ts
$superhero.metadata // Metadata<Superhero>

console.log($superhero)
// Prints:
//   $.object(
//     $.field("pseudonym", $.str),
//     $.optionalField("secretIdentity", $.str),
//     $.field("superpowers", $.array($.str))
//   )
```

## Examples

Further examples can be found in the
[`examples`](https://github.com/paritytech/scale-ts/tree/main/examples)
directory.

## Shape Naming Convention

This library adopts a convention of denoting shapes with a `$` – `$.foo` for
built-in shapes, and `$foo` for user-defined shapes. This makes shapes easily
distinguishable from other values, and makes it easier to have shapes in scope
with other variables:

```ts
interface Person { ... }
const $person = $.object(...)
const person = { ... }
```

Here, the type, shape, and a value can all coexist without clashing, without
having to resort to wordy workarounds like `personShape`.

The main other library this could possibly clash with is jQuery, and its usage
has waned enough that this is not a serious problem.

While we recommend following this convention for consistency, you can, of
course, adopt an alternative convention if the `$` is problematic – `$.foo` can
easily become `s.foo` or `subshape.foo` with an alternate import name.

## Asynchronous Encoding

Some shapes require asynchronous encoding. Calling `.encode()` on a shape will
throw if it or another shape it calls is asynchronous. In this case, you must
call `.encodeAsync()` instead, which returns a `Promise<Uint8Array>`. You can
call `.encodeAsync()` on any shape; if it is a synchronous shape, it will simply
resolve immediately.

Asynchronous decoding is not supported.

## Custom Shapes

If your encoding/decoding logic is more complicated, you can create custom
shapes with `createShape`:

```ts
const $foo = $.createShape<Foo>({
  metadata: $.metadata("$foo"),

  // A static estimation of the encoded size, in bytes.
  // This can be either an under- or over- estimate.
  staticSize: 123,
  subEncode(buffer, value) {
    // Encode `value` into `buffer.array`, starting at `buffer.index`.
    // A `DataView` is also supplied as `buffer.view`.
    // At first, you may only write at most as many bytes as `staticSize`.
    // After you write bytes, you must update `buffer.index` to be the first unwritten byte.

    // If you need to write more bytes, call `buffer.pushAlloc(size)`.
    // If you do this, you can then write at most `size` bytes,
    // and then you must call `buffer.popAlloc()`.

    // You can also call `buffer.insertArray()` to insert an array without consuming any bytes.

    // You can delegate to another shape by calling `$bar.subEncode(buffer, bar)`.
    // Before doing so, you must ensure that `$bar.staticSize` bytes are free,
    // either by including it in `staticSize` or by calling `buffer.pushAlloc()`.
    // Note that you should use `subEncode` and not `encode`.

    // See the `EncodeBuffer` class for information on other methods.

    // ...
  },

  subDecode(buffer) {
    // Decode `value` from `buffer.array`, starting at `buffer.index`.
    // A `DataView` is also supplied as `buffer.view`.
    // After you read bytes, you must update `buffer.index` to be the first unread byte.

    // You can delegate to another shape by calling `$bar.subDecode(buffer)`.
    // Note that you should use `subDecode` and not `decode`.

    // ...
    return value
  },

  subAssert(assert) {
    // Validate that `assert.value` is valid for this shape.
    // `assert` exposes various utility methods, such as `assert.instanceof`.
    // See the `AssertState` class for information on other methods.

    // You can delegate to another shape by calling `$bar.subAssert(assert)` or `$bar.subAssert(assert.access("key"))`.
    // Any errors thrown should be an instance of `$.ShapeAssertError`, and should use `assert.path`.

    // ...
  },
})
```
