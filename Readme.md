# SCALE Codecs for JavaScript and TypeScript

A TypeScript implementation of [SCALE (Simple Concatenated Aggregate Little-Endian) transcoding](https://docs.substrate.io/v3/advanced/scale-codec/) (see [Rust implementation here](https://github.com/paritytech/parity-scale-codec)), which emphasizes JS-land representations and e2e type-safety. These types are described [below](#types).

## Setup

If you're using [Deno](https://deno.land/), simply import via the `denoland/x` specifier.

```ts
import * as $ from "https://deno.land/x/scale/mod.ts";
```

If you're using [Node](https://nodejs.org/), install as follows.

```
npm install parity-scale-codec
```

Then import as follows.

```ts
import * as $ from "parity-scale-codec";
```

## Usage

1. Import the library
2. Define a codec via the library's functions, whose names correspond to types
3. Utilize the codec you've defined

## Example

```ts
import * as $ from "https://deno.land/x/scale/mod.ts";

const $person = $.object(
  ["name", $.str],
  ["nickName", $.str],
  ["superPower", $.option($.str)],
);

const valueToEncode = {
  name: "Magdalena",
  nickName: "Magz",
  superPower: "Hydrokinesis",
};

const encodedBytes: Uint8Array = $person.encode(valueToEncode);
const decodedValue: Person = $person.decode(encodedBytes);

assertEquals(decodedValue, valueToEncode);
```

To extract the JS-native TypeScript type from a given codec, use the `Native` utility type.

```ts
type Person = $.Native<typeof $person>;
/* {
  name: string;
  nickName: string;
  superPower: string | undefined;
} */
```

In cases where codecs are exceptionally large, we may want to spare the TS checker of extra work.

```ts
interface Person {
  name: string;
  nickName: string;
  superPower: string | undefined;
}

const $person: Codec<Person> = $.object(
  ["name", $.str],
  ["nickName", $.str],
  ["superPower", $.option($.str)],
);
```

This has the added benefit of producing type errors if the codec does not directly mirror the TS type.

```ts
const $person: Codec<Person> = $.object(
  //  ~~~~~~~
  //  ^ error (message below)
  ["nickName", $.str],
  ["superPower", $.option($.str)],
);
```

Hovering over the error squigglies will reveal the following diagnostic.

```
Type 'Codec<{ nickName: string; superPower: string | undefined; }>' is not assignable to type 'Codec<Person>'.
  The types returned by 'decode(...)' are incompatible between these types.
    Type '{ nickName: string; superPower: string | undefined; }' is not assignable to type 'Person'.
```

## Codec Naming

This library adopts a convention of denoting codecs with a `$` – `$.foo` for built-in codec, and `$foo` for user-defined codecs. This makes codecs easily distinguishable from other values, and makes it easier to have codecs in scope with other variables:

```ts
interface Person { ... }
const $person = $.object(...)
const person = { ... }
```

Here, the type, codec, and a value can all coexist without clashing, without having to resort to wordy workarounds like `personCodec`.

The main other library this could possibly clash with is jQuery, and its usage has waned enough that this is not a serious problem.

While we recommend following this convention for consistency, you can, of course, adopt an alternative convention if the `$` is problematic – `$.foo` can easily become `s.foo` or `scale.foo` with an alternate import name.

## Types

### Primitives

```ts
$.bool; // Codec<boolean>

$.u8; // Codec<number>
$.i8; // Codec<number>
$.u16; // Codec<number>
$.i16; // Codec<number>
$.u32; // Codec<number>
$.i32; // Codec<number>

$.u64; // Codec<bigint>
$.i64; // Codec<bigint>
$.u128; // Codec<bigint>
$.i128; // Codec<bigint>
$.u256; // Codec<bigint>
$.i256; // Codec<bigint>

// https://docs.substrate.io/v3/advanced/scale-codec/#compactgeneral-integers
$.compact; // Codec<number | bigint>

$.str; // Codec<string>
```

### Arrays

```ts
$.sizedArray($.u8, 2); // Codec<[number, number]>

$.array($.u8); // Codec<number[]>

$.uint8array; // Codec<Uint8Array>

$.tuple($.bool, $.u8, $.str); // Codec<[boolean, number, string]>
```

### Objects

```ts
const $person = $.object(
  ["name", $.str],
  ["nickName", $.str],
  ["superPower", $.option($.str)],
);

$person; /* Codec<{
  name: string;
  nickName: string;
  superPower: string | undefined;
}> */
```

### Iterables

```ts
$.set($.u8); // Codec<Set<number>>

$.map($.str, $.u8); // Codec<Map<string, number>>

const $manualSetU8 = $.iterable<number, Set<number>>({
  $el: $.u8,
  calcLength: (set) => set.size,
  rehydrate: (values) => new Set(values),
});

$manualSetU8; // Codec<Set<number>>
```

### Options

```ts
$.option($.u8); // Codec<number | undefined>
$.optionBool; // Codec<boolean | undefined> (stores as single byte; see OptionBool in Rust impl)
```

### Unions

#### Explicitly Discriminated

```ts
const $strOrNum = $.union(
  (value) => { // Discriminate
    if (typeof value === "string") {
      return 0;
    } else if (typeof value === "number") {
      return 1;
    } else {
      throw new Error("Unreachable");
    }
  },
  $.str, // Member 0
  $.u8, // Member 1
);

$strOrNum; // Codec<string | number>
```

#### Tagged Unions

```ts
const $pet = $.taggedUnion(
  "_tag",
  ["dog", ["bark", $.str]],
  ["cat", ["purr", $.str]],
);

$pet; /* Codec<
  | { _tag: "dog"; bark: string }
  | { _tag: "cat"; purr: string }
> */
```

#### Key Literals (aka., Native TypeScript Enums)

```ts
enum Dinosaur {
  Liopleurodon = "Liopleurodon",
  Kosmoceratops = "Kosmoceratops",
  Psittacosaurus = "Psittacosaurus",
}

const $dinosaur = $.keyLiteralUnion(
  Dinosaur.Liopleurodon,
  Dinosaur.Kosmoceratops,
  Dinosaur.Psittacosaurus,
);

$dinosaur; // Codec<Dinosaur>
```

#### Numeric Enums

```ts
enum Dinosaur {
  Liopleurodon,
  Kosmoceratops,
  Psittacosaurus,
}

const $dinosaur = $.u8 as Codec<Dinosaur>;

$dinosaur; // Codec<Dinosaur>
```

### Instance

Sometimes, you may want to instantiate a class with the decoded data / encode data from a class instance. In these situations, we can leverage the `instance` codec factory. A common use case for `instance` codecs is `Error` subtypes.

```ts
class MyError extends Error {
  constructor(
    readonly code: number,
    readonly message: string,
    readonly payload: {
      a: string;
      b: number;
      c: boolean;
    },
  ) {
    super();
  }
}

const $myError = $.instance(
  MyError,
  ["code", $.u8],
  ["message", $.str],
  [
    "payload",
    $.object(
      ["a", $.str],
      ["b", $.u8],
      ["c", $.bool],
    ),
  ],
);

$myError; // Codec<MyError>
```

### Results

`Result`s are initialized with an `Ok` codec and an `Error` instance codec.

```ts
class MyError {
  constructor(readonly message: string) {}
}

const $myError = $.instance(MyError, ["message", $.str]);

const $myResult = $.result($.str, $myError);

$myResult; // Codec<string | MyError>
```
