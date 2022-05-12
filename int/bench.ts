import { benchCodec } from "../test-util.ts";
import * as s from "./codec.ts";

benchCodec("u8", s.u8, 123);
benchCodec("u16", s.u16, 123);
benchCodec("u32", s.u32, 123);
benchCodec("u64", s.u64, 123n);
benchCodec("u128", s.u128, 123n);

benchCodec("i8", s.i8, 123);
benchCodec("i16", s.i16, 123);
benchCodec("i32", s.i32, 123);
benchCodec("i64", s.i64, 123n);
benchCodec("i128", s.i128, 123n);
