import { dirname, join } from "std/path/mod.ts";
import * as s from "../mod.ts";
import { benchCodec } from "../test-util.ts";

const trolleybus = "🚎";
const special = "œ∑é®†¥üîøπåß∂ƒ©˙∆˚¬Ω≈ç√∫ñµ";
const lipsum = await fetch(join(dirname(import.meta.url), "../lipsum.txt")).then((x) => x.text());
const cargoLock = await fetch(join(dirname(import.meta.url), "../Cargo.lock")).then((x) => x.text());

benchCodec(`""`, s.str, "");
benchCodec(`"abc"`, s.str, "abc");
benchCodec(`trolleybus`, s.str, trolleybus);
benchCodec(`special`, s.str, special);
benchCodec(`lipsum`, s.str, lipsum);
benchCodec(`cargoLock`, s.str, cargoLock);
benchCodec(`"abc" * 1000`, s.str, "abc".repeat(1000));
benchCodec(`trolleybus * 1000`, s.str, trolleybus.repeat(1000));
benchCodec(`special * 1000`, s.str, special.repeat(1000));
benchCodec(`lipsum * 1000`, s.str, lipsum.repeat(1000));
benchCodec(`cargoLock * 1000`, s.str, cargoLock.repeat(1000));
