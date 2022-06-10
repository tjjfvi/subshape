import { emptyDir } from "std/fs/mod.ts";
import { build } from "x/dnt/mod.ts";

await emptyDir("target/npm_pkg");

const DESCRIPTION = "A TypeScript Reference Implementation of SCALE Transcoding";

await build({
  entryPoints: ["mod.ts"],
  outDir: "target/npm_pkg",
  package: {
    // TODO: rename if/when we get access to `scale` package name
    name: "parity-scale-codec",
    version: Deno.args[0]!,
    description: DESCRIPTION,
    sideEffects: false,
    repository: "github:paritytech/parity-scale-codec-ts",
  },
  shims: {
    deno: true,
  },
  compilerOptions: {
    sourceMap: true,
    target: "ES2021",
  },
  importMap: "import_map.json",
  test: false,
});

await Deno.copyFile("Readme.md", "target/npm_pkg/Readme.md");
