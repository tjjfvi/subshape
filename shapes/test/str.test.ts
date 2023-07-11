import * as $ from "../../mod.ts"
import { files, testInvalid, testShape } from "../../test-util.ts"

testShape($.str, {
  "\"\"": "",
  quickBrownFox: "The quick brown fox jumps over the lazy dog",
  lipsum: await files.lipsum(),
  words: await files.words(),
  cargoLock: await files.cargoLock(),
})

testInvalid($.str, [null, undefined, 123, Symbol("foo")])
