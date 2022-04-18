import { emptyDir } from "std/fs/mod.ts";
import { build } from "x/dnt/mod.ts";

await emptyDir("target/npm_pkg");

const DESCRIPTION = "SCALE Transcoding in TypeScript";

await build({
  entryPoints: ["mod.ts"],
  outDir: "target/npm_pkg",
  package: {
    // TODO: rename if/when we get access to `scale` package name
    name: "scale-combinators",
    version: Deno.args[0]!,
    description: DESCRIPTION,
  },
  shims: {},
  compilerOptions: {
    sourceMap: true,
    target: "ES2021",
  },
  importMap: "import_map.json",
  test: false,
});
