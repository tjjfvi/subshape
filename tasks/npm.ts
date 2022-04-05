import { build } from "x/dnt/mod.ts";

const DESCRIPTION = "SCALE Transcoding in TypeScript";

await build({
  entryPoints: ["mod.ts"],
  outDir: "target/npm",
  package: {
    name: "scale",
    version: "0.1.0-beta.1",
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
