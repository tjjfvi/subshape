import * as $ from "../mod.ts";
import { files, testCodec } from "../test-util.ts";

testCodec("str", $.str, {
  "\"\"": "",
  quickBrownFox: "The quick brown fox jumps over the lazy dog",
  lipsum: await files.lipsum(),
  words: await files.words(),
  cargoLock: await files.cargoLock(),
});
