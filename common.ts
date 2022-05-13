export class Cursor {
  view;
  i = 0;

  constructor(readonly u8a: Uint8Array) {
    this.view = new DataView(u8a.buffer, u8a.byteOffset, u8a.byteLength);
  }
}

export type Native<C extends Codec> = C extends Codec<infer N> ? N : never;

/** A means of encoding and decoding a type `T` to and from its SCALE byte representation */
export abstract class Codec<T = any> {
  /** The minimum size of values encoded with this codec */
  abstract _minSize: number;
  /**
   * Accepts the decoded value and returns the size minus minSize.
   * May be overridden by subclasses.
   */
  _dynSize(value: T): number {
    value;
    return 0;
  }
  /**
   * If true, _dynSize will always return 0.
   * This may be overridden by subclasses, but it must still uphold the above contract.
   */
  _dynSizeZero = this._dynSize === Codec.prototype._dynSize;

  /** Accepts the cursor and value and writes its bytes into the cursor's byte array */
  abstract _encode(cursor: Cursor, value: T): void;

  /** Decodes the currently-focused bytes into `T` and moves the cursor as is appropriate */
  abstract _decode(cursor: Cursor): T;

  constructor() {}

  size(value: T): number {
    return this._minSize + this._dynSize(value);
  }

  /**
   * @param decoded the JS-native representation, `T`
   * @returns the SCALE byte representation of `T`
   */
  encode = (decoded: T): Uint8Array => {
    const cursor = new Cursor(new Uint8Array(this.size(decoded)));
    this._encode(cursor, decoded);
    return cursor.u8a;
  };

  /**
   * @param u8a the SCALE byte representation of `T`
   * @returns the JS-native representation, `T`
   */
  decode = (u8a: Uint8Array): T => {
    return this._decode(new Cursor(u8a));
  };
}

export type CodecList<T extends any[]> = {
  [Key in keyof T]: CodecList._0<Key, T[Key]>;
};
namespace CodecList {
  export type _0<Key extends PropertyKey, Value> = Key extends `${number}` ? Codec<Value> : Value;
}

export type ValueOf<X> = X[keyof X];

// TODO: replace with safer `Entries` if such a utility type comes into existence
export type Entries<X> = ValueOf<
  { [K in keyof X]: [K, Codec<X[K]>] }
>[];

// // Causes issues with recursion depth / checker performance
// export type Entries<X> = ValueOf<
//   {
//     [K in keyof X]: [
//       [K, X[K]],
//       ...([Entries<Omit<X, K>>] extends [never] ? [] : Entries<Omit<X, K>>),
//     ];
//   }
// >;

export type Flatten<T> = T extends Function ? T : { [K in keyof T]: T[K] };
