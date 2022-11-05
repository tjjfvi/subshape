# SCALE Codecs for JavaScript and TypeScript

A TypeScript implementation of [SCALE (Simple Concatenated Aggregate Little-Endian) transcoding](https://docs.substrate.io/reference/scale-codec/) (see [Rust implementation here](https://github.com/paritytech/parity-scale-codec)), which emphasizes JS-land representations and e2e type-safety.

## Setup

If you're using [Deno](https://deno.land/), simply import via the `deno.land/x` specifier.

```ts
import * as $ from "https://deno.land/x/scale/mod.ts";
```

If you're using [Node](https://nodejs.org/), install as follows.

```
npm install scale-codec
```

Then import as follows.

```ts
import * as $ from "scale-codec";
```

## Usage

1. Import the library
2. Define a codec via the library's functions, whose names correspond to types
3. Utilize the codec you've defined

## Example

```ts
import * as $ from "https://deno.land/x/scale/mod.ts";

const $superhero = $.object(
  ["pseudonym", $.str],
  ["secretIdentity", $.option($.str)],
  ["superpowers", $.array($.str)],
);

const valueToEncode = {
  pseudonym: "Spider-Man",
  secretIdentity: "Peter Parker",
  superpowers: ["does whatever a spider can"],
};

const encodedBytes: Uint8Array = $superhero.encode(valueToEncode);
const decodedValue: Superhero = $superhero.decode(encodedBytes);

assertEquals(decodedValue, valueToEncode);
```

To extract the JS-native TypeScript type from a given codec, use the `Native` utility type.

```ts
type Superhero = $.Native<typeof $superhero>;
// {
//   pseudonym: string;
//   secretIdentity: string | undefined;
//   superpowers: string[];
// }
```

You can also explicitly type the codec, which will validate that the inferred type aligns with the expected.

```ts
interface Superhero {
  pseudonym: string;
  secretIdentity: string | undefined;
  superpowers: string[];
}

const $superhero: Codec<Superhero> = $.object(
  ["pseudonym", $.str],
  ["secretIdentity", $.option($.str)],
  ["superpowers", $.array($.str)],
);

// @ts-expect-error
//   Type 'Codec<{ pseudonym: string; secretIdentity: string | undefined; }>' is not assignable to type 'Codec<Superhero>'.
//     The types returned by 'decode(...)' are incompatible between these types.
//       Type '{ pseudonym: string; secretIdentity: string | undefined; }' is not assignable to type 'Superhero'.
const $plebeianHero: Codec<Superhero> = $.object(
  ["pseudonym", $.str],
  ["secretIdentity", $.option($.str)],
);
```

Further examples can be found in the [`examples`](https://github.com/paritytech/scale-ts/tree/main/examples) directory.

## Codec Naming

This library adopts a convention of denoting codecs with a `$` – `$.foo` for built-in codecs, and `$foo` for user-defined codecs. This makes codecs easily distinguishable from other values, and makes it easier to have codecs in scope with other variables:

```ts
interface Person { ... }
const $person = $.object(...)
const person = { ... }
```

Here, the type, codec, and a value can all coexist without clashing, without having to resort to wordy workarounds like `personCodec`.

The main other library this could possibly clash with is jQuery, and its usage has waned enough that this is not a serious problem.

While we recommend following this convention for consistency, you can, of course, adopt an alternative convention if the `$` is problematic – `$.foo` can easily become `s.foo` or `scale.foo` with an alternate import name.

## Asynchronous Encoding

Some codecs require asynchronous encoding. Calling `.encode()` on a codec will throw if it or another codec it calls is asynchronous. In this case, you must call `.encodeAsync()` instead, which returns a `Promise<Uint8Array>`. You can call `.encodeAsync()` on any codec; if it is a synchronous codec, it will simply resolve immediately.

Asynchronous decoding is not supported.

## Custom Codecs

If your encoding/decoding logic is more complicated, you can create custom codecs with `createCodec`:

```ts
const $foo = createCodec<Foo>({
  name: "$foo",
  _metadata: null, // see jsdoc

  // A static estimation of the encoded size, in bytes.
  // This can be either an under- or over- estimate.
  _staticSize: 123,
  _encode(buffer, value) {
    // Encode `value` into `buffer.array`, starting at `buffer.index`.
    // A `DataView` is also supplied as `buffer.view`.
    // At first, you may only write at most as many bytes as `_staticSize`.
    // After you write bytes, you must update `buffer.index` to be the first unwritten byte.

    // If you need to write more bytes, call `buffer.pushAlloc(size)`.
    // If you do this, you can then write at most `size` bytes,
    // and then you must call `buffer.popAlloc()`.

    // You can also call `buffer.insertArray()` to insert an array without consuming any bytes.

    // You can delegate to another codec by calling `$bar._encode(buffer, bar)`.
    // Before doing so, you must ensure that `$bar._staticSize` bytes are free,
    // either by including it in `_staticSize` or by calling `buffer.pushAlloc()`.
    // Note that you should use `_encode` and not `encode`.

    // See the `EncodeBuffer` class for information on other methods.

    // ...
  },

  _decode(buffer) {
    // Decode `value` from `buffer.array`, starting at `buffer.index`.
    // A `DataView` is also supplied as `buffer.view`.
    // After you read bytes, you must update `buffer.index` to be the first unread byte.

    // You can delegate to another codec by calling `$bar._decode(buffer)`.
    // Note that you should use `_decode` and not `decode`.

    // ...
    return value;
  },
});
```
