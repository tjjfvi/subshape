import * as $ from "../../mod.ts"
import { benchShape, files } from "../../test-util.ts"

const trolleybus = "🚎"
const special = "œ∑é®†¥üîøπåß∂ƒ©˙∆˚¬Ω≈ç√∫ñµ"
const lipsum = await files.lipsum()
const cargoLock = await files.cargoLock()

benchShape(`""`, $.str, "")
benchShape(`"abc"`, $.str, "abc")
benchShape(`trolleybus`, $.str, trolleybus)
benchShape(`special`, $.str, special)
benchShape(`lipsum`, $.str, lipsum)
benchShape(`cargoLock`, $.str, cargoLock)
benchShape(`"abc" * 1000`, $.str, "abc".repeat(1000))
benchShape(`trolleybus * 1000`, $.str, trolleybus.repeat(1000))
benchShape(`special * 1000`, $.str, special.repeat(1000))
benchShape(`lipsum * 1000`, $.str, lipsum.repeat(1000))
benchShape(`cargoLock * 1000`, $.str, cargoLock.repeat(1000))
