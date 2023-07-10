import { emptyDir } from "https://deno.land/std@0.161.0/fs/mod.ts"
import { build } from "https://deno.land/x/dnt@0.33.0/mod.ts"

await emptyDir("target/npm_pkg")

const DESCRIPTION = "TODO: description"

await build({
  entryPoints: ["mod.ts"],
  outDir: "target/npm_pkg",
  package: {
    name: "subshape",
    version: Deno.args[0]!,
    description: DESCRIPTION,
    sideEffects: false,
    repository: "github:paritytech/subshape",
  },
  shims: {
    deno: {
      test: true,
    },
  },
  compilerOptions: {
    sourceMap: true,
    target: "ES2021",
    lib: ["es2021", "dom"], // https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/60038
  },
  test: false,
})

await Deno.copyFile("Readme.md", "target/npm_pkg/Readme.md")
