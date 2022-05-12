# SCALE Codecs for JavaScript and TypeScript

A TypeScript implementation of [SCALE (Simple Concatenated Aggregate Little-Endian) transcoding](https://docs.substrate.io/v3/advanced/scale-codec/) (see [Rust implementation here](https://github.com/paritytech/parity-scale-codec)), which emphasizes JS-land representations and e2e type-safety. These types are described [below](#types).

⚠️ This TypeScript implementation of Parity's SCALE Codecs is in beta. If you encounter a bug or want to give feedback on the API design, please create an issue.

## Setup

If you're using [Deno](https://deno.land/), simply import via the `denoland/x` specifier.

```ts
import * as $ from "https://deno.land/x/scale/mod.ts";
```

If you're using [Node](https://nodejs.org/), install as follows.

```
npm install parity-scale-codec
```

> NOTE: The published package name is (while in beta) subject to change

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

const $person = $.record(
  ["name", $.str],
  ["nickName", $.str],
  ["superPower", $.option($.str)],
);

const valueToEncode = {
  name: "Magdalena",
  nickName: "Magz",
  superPower: "Hydrokinesis",
};

const encodedBytes = $person.encode(valueToEncode);
const decodedValue = $person.decode(encodedBytes);

assertEquals(decodedValue, valueToEncode);
```

To extract the JS-native TypeScript type from a given codec, use the `Native` utility type.

```ts
type NativeType = $.Native<typeof $person>;

assertTypeEquals<NativeType, {
  name: string;
  nickName: string;
  superPower: string | undefined;
}>();
```

In cases where codecs are exceptionally large, we may want to spare the TS checker of extra work.

```ts
interface Person {
  name: string;
  nickName: string;
  superPower: string | undefined;
}

const $person: Codec<Person> = $.record(
  ["name", $.str],
  ["nickName", $.str],
  ["superPower", $.option($.str)],
);
```

This has the added benefit of producing type errors if the codec does not directly mirror the TS type.

```ts
const $person: Codec<Person> = $.record(
  //  ~~~~~
  //  ^ error (message below)
  ["nickName", $.str],
  ["superPower", $.option($.str)],
);
```

Hovering over the error squigglies will reveal the following diagnostic.

```
Type 'Record<[["name", Codec<string>], ["nickName", Codec<string>]], "name" | "nickName", Codec<string>>' is not assignable to type 'Codec<Person>'.
  The types returned by '_d(...)' are incompatible between these types.
    Property 'superPower' is missing in type '{ name: string; } & { nickName: string; }' but required in type 'Person'.
```

## Error Handling

This library **intentionally** does not check for conditions that would suggest an error. If an error is produced, it is because of invalid input or incompatibility between the input and codec definition. This library prioritizes performance over end-developer DX, as it is not intended for end developers, but rather for tool developers.

## Types

### Booleans

```ts
const bytes = $.bool.encode(true);
const value = $.bool.decode(bytes);
```

### Integers

```ts
const bytes = $.u8.encode(9);
const value = $.u8.decode(bytes);
```

Other such integer types include `i8`, `u16`, `i16`, `u32`, `i32`, `u64`, `i64`, `u128`, `i128` and [`compact`](https://docs.substrate.io/v3/advanced/scale-codec/#compactgeneral-integers).

### Options

```ts
const $foo = $.option($.u8);

const bytes1 = $foo.encode(27);
const value1 = $foo.decode(bytes1);

const bytes2 = $foo.encode(undefined);
const value2 = $foo.decode(bytes2);
```

### Arrays

#### Sized

```ts
const $bar = $.sizedArray($.u8, 2);

const bytes = $bar.encode([3, 9]);
const value = $bar.decode(bytes);
```

#### Dynamic

```ts
const $baz = $.array($.u8);

const bytes = $baz.encode([1, 2, 3, 4, 5]);
const value = $baz.decode(bytes);
```

### Tuples

```ts
const $qux = $.tuple($.bool, $.u8, $.str);

const bytes = $qux.encode([true, 81, "｡＾・ｪ・＾｡"]);
const value = $qux.decode(bytes);
```

### Records

```ts
const $person = $.record(
  ["name", $.str],
  ["nickName", $.str],
  ["superPower", $.option($.str)],
);

const bytes = $person.encode({
  name: "Magdalena",
  nickName: "Magz",
  superPower: "Hydrokinesis",
});
const value = $person.decode(bytes);
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
  $.str, // Member `0`
  $.u8, // Member `1`
);

const bytes1 = $strOrNum.encode(27);
const value1 = $strOrNum.decode(bytes1);

const bytes2 = $strOrNum.encode("Parity");
const value2 = $strOrNum.decode(bytes2);
```

#### Tagged

```ts
const $pet = $.taggedUnion(
  "_tag",
  ["dog", ["bark", $.str]],
  ["cat", ["purr", $.str]],
);

const bytes1 = $pet.encode({
  _tag: "dog",
  bark: "Roof",
});
const value1 = $pet.decode(bytes1);

const bytes2 = $pet.encode({
  _tag: "cat",
  purr: "Meow",
});
const value2 = $pet.decode(bytes2);
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

const encoded = $dinosaur.encode(Dinosaur.Psittacosaurus);
assertEquals(encoded, new Uint8Array([2]));

const decoded = $dinosaur.decode(encoded);
assertEquals(decoded, Dinosaur.Psittacosaurus);
```

<!-- TODO: narrowing gif -->

### Instance

Sometimes, you may want to instantiate a class with the decoded data / encode data from a class instance. In these situations, we can leverage the `instance` codec factory.

A common use case for `Instance` codecs is `Error` subtypes. Let's say we want to decode some data into the following `Error` subtype.

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
```

We can do so as follows.

```ts
const $myError = $.instance(
  MyError,
  ["code", $.u8],
  ["message", $.str],
  [
    "payload",
    $.record(
      ["a", $.str],
      ["b", $.u8],
      ["c", $.bool],
    ),
  ],
);
```

We can now use this codec to encode and decode `MyError`.

```ts
const myError = new MyError(
  1,
  "At war with my Arch system config",
  {
    a: "a",
    b: 2,
    c: true,
  },
);

const encodedBytes = $myError.encode(myError);
const decoded = $myError.decode(encodedBytes);
```

> Note: executing an equality assertion between `myError` and `decoded` will fail, as they contain different stack traces.

### Results

`Result`s are initialized with an `Ok` codec and an `Error` instance codec.

```ts
class MyError {
  constructor(readonly message: string) {}
}
const $myError = $.instance(MyError, ["message", $.str]);

const $myResult = $.result($myError, $.str);

const errorBytes = $myResult.encode(new MyError("Uh oh!"));
const errorDecoded = $myResult.decode(errorBytes);

const okBytes = $myResult.encode("YES!");
const okDecoded = $myResult.decode(okBytes);
```
