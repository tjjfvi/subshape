import * as fs from "std/fs/mod.ts";
import * as path from "std/path/mod.ts";

let generated = "";
for await (
  const entry of fs.walk(".", {
    match: [/\.ts$/],
    skip: [/^target\//],
  })
) {
  generated += `import ${JSON.stringify(`./${entry.path}`)};\n`;
}

const dest = path.join(Deno.cwd(), "_star.ts");
console.log(`Writing "${dest}".`);
await Deno.writeTextFile(dest, generated);
