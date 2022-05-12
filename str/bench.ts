import { dirname, join } from "std/path/mod.ts";
import * as $ from "../mod.ts";
import { benchCodec } from "../test-util.ts";

const trolleybus = "🚎";
const special = "œ∑é®†¥üîøπåß∂ƒ©˙∆˚¬Ω≈ç√∫ñµ";
const lipsum = await fetch(join(dirname(import.meta.url), "../lipsum.txt")).then((x) => x.text());
const cargoLock = await fetch(join(dirname(import.meta.url), "../Cargo.lock")).then((x) => x.text());

benchCodec(`""`, $.str, "");
benchCodec(`"abc"`, $.str, "abc");
benchCodec(`trolleybus`, $.str, trolleybus);
benchCodec(`special`, $.str, special);
benchCodec(`lipsum`, $.str, lipsum);
benchCodec(`cargoLock`, $.str, cargoLock);
benchCodec(`"abc" * 1000`, $.str, "abc".repeat(1000));
benchCodec(`trolleybus * 1000`, $.str, trolleybus.repeat(1000));
benchCodec(`special * 1000`, $.str, special.repeat(1000));
benchCodec(`lipsum * 1000`, $.str, lipsum.repeat(1000));
benchCodec(`cargoLock * 1000`, $.str, cargoLock.repeat(1000));
