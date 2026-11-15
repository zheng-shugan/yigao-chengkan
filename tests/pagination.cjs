const { chromium } = require("playwright-core");
const { build } = require("esbuild");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    executablePath: process.env.CHROME_BIN || undefined
  });
  try {
    const page = await browser.newPage();
    const bundle = await build({
      stdin: { contents: 'export * from "./src/layout"; export * from "./src/article";', resolveDir: process.cwd() },
      bundle: true, write: false, format: "iife", globalName: "plugin"
    });
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const result = await page.evaluate(async () => {
      const expect = (ok, message) => { if (!ok) throw new Error(message); };
      const normalize = s => s.replace(/\s+/g, "");
      let seed = 104709;
      const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
      const shots = [];
      async function picture(width, height, key, table = false) {
        const c = document.createElement("canvas");
        c.width = width; c.height = height;
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#e8f1ee"; ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#203a33"; ctx.font = "20px sans-serif";
        for (let y = 32; y < height; y += 34) {
          ctx.fillText(table ? "数据记录   04:17   149   3.2" : key, 20, y);
        }
        const figure = document.createElement("figure");
        const img = new Image(); img.src = c.toDataURL(); img.dataset.source = key;
        await img.decode(); figure.append(img); return figure;
      }
      async function verify(blocks) {
        document.body.replaceChildren();
        const expected = normalize(blocks.map(b => b.textContent).join(""));
        const keys = blocks.flatMap(b => [...b.querySelectorAll("img")].map(i=>i.dataset.source));
        const pages = plugin.paginate(document, blocks);
        expect(expected === normalize(pages.map(pg=>pg.textContent).join("")), "Text changed");
        const placed = pages.flatMap(pg=>[...pg.querySelectorAll("img")]);
        expect(JSON.stringify(keys) === JSON.stringify(placed.map(i=>i.dataset.source)), "Image order changed");
        for (const pg of pages) {
          const box = pg.getBoundingClientRect();
          for (const el of pg.children) {
            expect(el.getBoundingClientRect().bottom <= box.bottom - 78 + .03, "Page overflow");
          }
        }
        for (const img of placed) {
          const {width,height} = img.getBoundingClientRect();
          expect(Math.abs(height - width * img.naturalHeight / img.naturalWidth) < 1, "Image distorted");
        }
        return pages;
      }
      const filler = height => {
        const el = document.createElement("div"); el.style.height = height + "px"; return el;
      };
      const para = text => Object.assign(document.createElement("p"), {textContent:text});
      for (const space of [800, 700, 600, 599]) {
        const fig = await picture(600, 800, "threshold", true);
        const pages = await verify([filler(1284 - 25 - space), fig]);
        expect(pages.length === (space >= 600 ? 1 : 2), "75% boundary at " + space);
        if (space === 600) {
          shots.push(await (await plugin.renderPNG(pages[0])).arrayBuffer());
        }
      }
      for (const fixed of [false, true]) {
        const lead = para("下图展示本次记录。"), tail = para("这些数据用于后续比较。");
        const fig = await picture(600, 1284, "table", true);
        if (fixed) fig.firstChild.dataset.width = "600";
        const pages = await verify([filler(920), lead, fig, tail]);
        expect((lead.parentNode === fig.parentNode) === !fixed, "Lead carry or fixed width");
        expect((fig.firstChild.getBoundingClientRect().width === 600) === fixed, "Image sizing");
      }
      {
        const fig = await picture(600, 1284, "trailing", true), tail = para("本次测试结束。");
        await verify([filler(1100), fig, tail]);
        expect(fig.parentNode === tail.parentNode, "Trailing text orphaned");
        shots.push(await (await plugin.renderPNG(fig.parentNode)).arrayBuffer());
      }
      for (let i = 0; i < 16; i++) {
        const source = ["# 随机样本 " + i];
        for (let j = 0; j < 3 + i % 6; j++) {
          if (random(3)) source.push("自动生成的测量记录。".repeat(1 + random(80)));
          source.push("![[附件" + j + ".png" + (j === 0 ? "|360" : "") + "]]");
        }
        const blocks = plugin.article(document, source.join("\n\n"), "样本");
        for (const img of blocks.flatMap(b=>[...b.querySelectorAll("img")])) {
          const generated = await picture(360 + random(550), 280 + random(960), img.dataset.source);
          img.src = generated.firstChild.src; await img.decode();
          if (img.dataset.source === "附件0.png") {
            expect(img.dataset.width === "360", "Explicit width lost");
            img.style.width = "360px";
          }
        }
        await verify(blocks);
      }
      return shots.map(buffer=>Array.from(new Uint8Array(buffer)));
    });
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "publish-picture-layout-"));
    for (const [i, bytes] of result.entries()) {
      const png = Buffer.from(bytes);
      assert.equal(png.readUInt32BE(16),1080);
      assert.equal(png.readUInt32BE(20),1440);
      await fs.writeFile(path.join(dir, i + ".png"), png);
    }
    console.log("全部分页用例通过。抽查 PNG：" + dir);
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
