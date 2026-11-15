import { mkdir, writeFile, unlink, rmdir } from "node:fs/promises";
import { join } from "node:path";

export async function writePages(parent: string, title: string, pages: Blob[]): Promise<string> {
  let name = title.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").replace(/[. ]+$/g, "").trim() || "笔记";
  name = Array.from(name).slice(0, 60).join("");
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(name)) name = "_" + name;
  let target: string;
  for (let n = 1; ; n++) {
    target = join(parent, n === 1 ? name : name + " (" + n + ")");
    try { await mkdir(target); break; }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e; }
  }
  const files: string[] = [];
  try {
    for (const [i, blob] of pages.entries()) {
      const path = join(target, String(i + 1).padStart(Math.max(3, String(pages.length).length), "0") + ".png");
      files.push(path);
      await writeFile(path, Buffer.from(await blob.arrayBuffer()), { flag: "wx" });
    }
    return target;
  } catch (error) {
    await Promise.allSettled(files.map(file => unlink(file)));
    await rmdir(target).catch(() => {});
    throw error;
  }
}
