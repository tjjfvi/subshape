import * as fs from "https://deno.land/std@0.161.0/fs/mod.ts"
import * as path from "https://deno.land/std@0.161.0/path/mod.ts"

let generated = ""
for await (
  const entry of fs.walk(".", {
    match: [/\.ts$/],
    skip: [/^target\//],
  })
) {
  generated += `import ${JSON.stringify(`../${entry.path}`)};\n`
}

const dest = path.join(Deno.cwd(), "target/star.ts")
console.log(`Writing "${dest}".`)
await Deno.writeTextFile(dest, generated)
