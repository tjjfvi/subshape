import { Decoder, Encoder, Native, Transcoder } from "/common.ts";
import { compactDecoder, compactEncoder } from "/compact.ts";

/** Native representation of an array */
export type NativeArray<
  ElDecoder extends Transcoder,
  Len extends number = number,
> = Native<ElDecoder>[] & { length: Len };

/** Decode an array of known length */
export class SizedArrayDecoder<
  ElDecoder extends Decoder,
  Len extends number,
> extends Decoder<NativeArray<ElDecoder, Len>> {
  /**
   * @param elDecoder The element decoder
   * @param len The number of elements belonging to the array
   */
  constructor(
    elDecoder: ElDecoder,
    len: Len,
  ) {
    super((cursor) => {
      const result: Native<ElDecoder>[] = [];
      for (let i = 0; i < len; i++) {
        result.push(elDecoder._d(cursor));
      }
      return result as NativeArray<ElDecoder, Len>;
    });
  }
}

/** Encode an array of known length */
export class SizedArrayEncoder<
  ElEncoder extends Encoder,
  Len extends number,
> extends Encoder<NativeArray<ElEncoder, Len>> {
  /**
   * @param elEncoder The element encoder
   * @param len The number of elements belonging to the to-be-encoded array
   */
  constructor(
    elEncoder: ElEncoder,
    len: Len,
  ) {
    super(
      (cursor, value) => {
        for (let i = 0; i < len; i++) {
          elEncoder._e(cursor, value[i]);
        }
      },
      (value) => {
        let sum = 0;
        for (let i = 0; i < len; i++) {
          sum += elEncoder._s(value[i]);
        }
        return sum;
      },
    );
  }
}

/** Decode an array of unknown length */
export class ArrayDecoder<ElDecoder extends Decoder> extends Decoder<NativeArray<ElDecoder>> {
  /**
   * @param elDecoder The element decoder
   */
  constructor(elDecoder: ElDecoder) {
    super((cursor) => {
      return new SizedArrayDecoder(elDecoder, Number(compactDecoder._d(cursor)))._d(cursor);
    });
  }
}

/** Encode an array of unknown length */
export class ArrayEncoder<ElEncoder extends Encoder> extends Encoder<NativeArray<ElEncoder>> {
  /**
   * @param elEncoder The element encoder
   */
  constructor(elEncoder: ElEncoder) {
    super(
      (cursor, value) => {
        compactEncoder._e(cursor, value.length);
        new SizedArrayEncoder(elEncoder, value.length)._e(cursor, value);
      },
      (value) => {
        return compactEncoder._s(value.length) + new SizedArrayEncoder(elEncoder, value.length)._s(value);
      },
    );
  }
}
