import { readFile } from "node:fs/promises";
import { build } from "esbuild";

// Include the notices in main.js so they travel with both installation methods.
const bundledLicenses = [
  ["entities", "LICENSE"],
  ["linkify-it", "LICENSE"],
  ["markdown-it", "LICENSE"],
  ["mdurl", "LICENSE"],
  ["punycode.js", "LICENSE-MIT.txt"],
  ["uc.micro", "LICENSE.txt"],
];
const notices = await Promise.all([
  readFile("LICENSE", "utf8"),
  ...bundledLicenses.map(async ([name, filename]) => {
    const notice = await readFile(`node_modules/${name}/${filename}`, "utf8");
    return `${name}\n${notice.trim()}`;
  }),
]);
const licenseBanner = notices.map(notice => notice.trim().replace(/\r\n/g, "\n"))
  .join("\n\n")
  .split("\n")
  .map(line => line ? `// ${line}` : "//")
  .join("\n");

await build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  external: ["obsidian", "electron", "@electron/remote"],
  outfile: "main.js",
  banner: { js: licenseBanner },
});
