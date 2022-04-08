# SCALE

A TypeScript implementation of [SCALE (Simple Concatenated Aggregate Little-Endian) transcoding](https://docs.substrate.io/v3/advanced/scale-codec/) (see [Rust implementation here](https://github.com/paritytech/parity-scale-codec)), which emphasizes JS-land representations and e2e type-safety. These types are described [below](#types).

## Setup

Install the `scale` NPM package.

```
npm install scale
```

> NOTE: This is not yet published (while WIP, clone and use a local copy)

> NOTE: The published package name is subject to change, as we may not be able to get `scale`

> Deno users can reference the library root from `https://deno.land/x/scale/mod.ts`.

## Usage

1. Import the library
2. Define a codec via the library's functions, whose names correspond to types
3. Utilize the codec you've defined

## Example

```ts
// 1
import * as s from "scale";

// 2
const codec = new s.record(
  new s.field("name", s.str),
  new s.field("nickName", s.str),
  new s.field("superPower", s.option(s.str)),
);

// 3
const decoded = codec.decode(bytes); // <- `bytes` needs to be in scope & valid
```

In this example, `decoded` should contain the "inflated" data.

```ts
type Value = s.Native<typeof codec>;

const value: Value = {
  name: "Magdalena",
  nickName: "Magz",
  superPower: "Hydrokinesis",
};

const encoded = codec.encode(value);
const decoded = codec.decode(encoded);
```

The signature of `decoded` will look as does the following interface.

```ts
interface NativeType {
  name: string;
  nickName: string;
  superPower: string | undefined;
}
```

In cases where codecs are exceptionally large, we may want to spare the TS checker of extra work.

```diff
- const codec = s.record(
+ const codec: Codec<NativeType> = s.record(
    new s.field("name", s.str),
    new s.field("nickName", s.str),
    new s.field("superPower", s.option(s.str)),
  );
```

This has the added benefit of producing type errors if the codec does not directly mirror the TS type.

```ts
const codec: Codec<NativeType> = s.record(
  s.field("nickName", s.str),
  s.field("superPower", s.option(s.str)),
);

// ^ type error: field `name` is missing from `codec`
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

### Compacts

```ts
const bytes = s.compact.encode(BigInt(2 ^ 30 - 1));
const value = s.compact.decode(bytes);
```

### Options

```ts
const codec = s.option(s.u8);

const bytes1 = codec.encode(27);
const value1 = codec.decode(bytes1);

const bytes2 = codec.encode(undefined);
const value2 = codec.decode(bytes2);
```

### Arrays

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
  s.field("name", s.str),
  s.field("nickName", s.str),
  s.field("superPower", s.option(s.str)),
);

const bytes = codec.encode({
  name: "Magdalena",
  nickName: "Magz",
  superPower: "Hydrokinesis",
});
const value = codec.decode(bytes);
```

### Unions

#### Classic

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
  s.taggedUnionMember("dog", s.field("bark", s.str)),
  s.taggedUnionMember("cat", s.field("pur", s.str)),
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
