# SCALE

A TypeScript implementation of [SCALE (Simple Concatenated Aggregate Little-Endian) transcoding](https://docs.substrate.io/v3/advanced/scale-codec/) (see [Rust implementation here](https://github.com/paritytech/parity-scale-codec)), which emphasizes JS-land representations and e2e type-safety. These types are described [below](#types).

## Setup

If you're using Deno, simply import via the `denoland/x` specifier.

```ts
import * as s from "https://deno.land/x/scale/mod.ts";
```

If you're using Node, install as follows.

```
npm install scale-ts
```

> NOTE: The published package name is (while in beta) subject to change

Then import as follows.

```ts
import * as s from "scale";
```

## Usage

1. Import the library
2. Define a codec via the library's functions, whose names correspond to types
3. Utilize the codec you've defined

## Example

```ts
// 1
import * as s from "https://deno.land/x/scale/mod.ts";

// 2
const codec = new s.record(
  ["name", s.str],
  ["nickName", s.str],
  ["superPower", s.option(s.str)],
);

const valueToEncode = {
  name: "Magdalena",
  nickName: "Magz",
  superPower: "Hydrokinesis",
};

const encodedBytes = codec.encode(valueToEncode);
const decodedValue = codec.decode(encodedBytes);

assertEquals(decodedValue, valueToEncode);
```

To extract the JS-native TypeScript type from a given codec, use the `Native` utility type.

```ts
type NativeType = s.Native<typeof codec>;

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

const codec: Codec<Person> = s.record(
  ["name", s.str],
  ["nickName", s.str],
  ["superPower", s.option(s.str)],
);
```

This has the added benefit of producing type errors if the codec does not directly mirror the TS type.

```ts
const codec: Codec<NativeType> = s.record(
  //  ~~~~~
  //  ^ error (message below)
  s.field("nickName", s.str),
  s.field("superPower", s.option(s.str)),
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
const bytes = s.bool.encode(true);
const value = s.bool.decode(bytes);
```

### Integers

```ts
const bytes = s.u8.encode(9);
const value = s.u8.decode(bytes);
```

Other such integer types include `i8`, `u16`, `i16`, `u32`, `i32`, `u64`, `i64`, `u128`, `i128` and [`compact`](https://docs.substrate.io/v3/advanced/scale-codec/#compactgeneral-integers).

### Options

```ts
const codec = s.option(s.u8);

const bytes1 = codec.encode(27);
const value1 = codec.decode(bytes1);

const bytes2 = codec.encode(undefined);
const value2 = codec.decode(bytes2);
```

### Arrays

#### Sized

```ts
const codec = s.sizedArray(s.u8, 2);

const bytes = codec.encode([3, 9]);
const value = codec.decode(bytes);
```

#### Dynamic

```ts
const codec = s.array(s.u8);

const bytes = codec.encode([1, 2, 3, 4, 5]);
const value = codec.decode(bytes);
```

### Tuples

```ts
const codec = s.tuple(s.bool, s.u8, s.str);

const bytes = codec.encode([true, 81, "｡＾・ｪ・＾｡"]);
const value = codec.decode(bytes);
```

### Records

```ts
const codec = s.record(
  ["name", s.str],
  ["nickName", s.str],
  ["superPower", s.option(s.str)],
);

const bytes = codec.encode({
  name: "Magdalena",
  nickName: "Magz",
  superPower: "Hydrokinesis",
});
const value = codec.decode(bytes);
```

### Unions

#### Explicitly Discriminated

```ts
const codec = s.union(
  (value) => { // Discriminate
    if (typeof value === "string") {
      return 0;
    } else if (typeof value === "number") {
      return 1;
    } else {
      throw new Error("Unreachable");
    }
  },
  s.str, // Member `0`
  s.u8, // Member `1`
);

const bytes1 = codec.encode(27);
const value1 = codec.decode(bytes1);

const bytes2 = codec.encode("Parity");
const value2 = codec.decode(bytes2);
```

#### Tagged

```ts
const codec = s.taggedUnion(
  "_tag",
  ["dog", ["bark", s.str]],
  ["cat", ["pur", s.str]],
);

const bytes1 = codec.encode({
  _tag: "dog",
  bark: "Roof",
});
const value1 = codec.decode(bytes1);

const bytes2 = codec.encode({
  _tag: "cat",
  pur: "Meow",
});
const value2 = codec.decode(bytes2);
```

<!-- TODO: narrowing gif -->

### Results

```ts
interface MyErrData {
  message: string;
}
const myErrData = s.record(
  s.field("message", s.str),
);
class MyErr {
  constructor(readonly data: MyErrorData) {}
}

class MyOk {
  constructor(readonly ok: string) {}
}

const codec = s.Result(
  s.ok(MyOk, s.str),
  s.err(MyErr, myErrData),
);

const bytes1 = codec.encode(new MyErr({ message: "Uh oh!" }));
const value1 = codec.decode(bytes1);

const bytes2 = codec.encode(new Ok("YES!"));
const value2 = codec.decode(bytes2);
```
