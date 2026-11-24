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
      bundle: true, write: false, format: "iife", globalName: "plugin", external: ["obsidian"]
    });
    // Match the fragment interface here. Sanitization itself runs in Obsidian.
    await page.evaluate(() => {
      window.require = () => ({
        sanitizeHTMLToDom: html => document.createRange().createContextualFragment(html),
      });
    });
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const result = await page.evaluate(async () => {
      const expect = (ok, message) => { if (!ok) throw new Error(message); };
      const normalize = s => s.replace(/\s+/g, "");
      let seed = 104709;
      const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
      const shots = [];
      async function picture(width, height, key, table = false, density = 1) {
        const c = document.createElement("canvas");
        c.width = width * density; c.height = height * density;
        const ctx = c.getContext("2d");
        ctx.scale(density, density);
        ctx.fillStyle = "#e8f1ee"; ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#203a33"; ctx.font = "20px sans-serif";
        for (let y = 32; y < height; y += 34) {
          ctx.fillText(table ? (y === 32 ? "公里　　分段配速　　平均心率" : String((y - 32) / 34).padStart(2, "0") + "　　　 04:" + String(10 + y % 40) + "　　　 " + (145 + y % 30)) : key, 20, y);
        }
        const figure = document.createElement("figure");
        const img = new Image(); img.src = c.toDataURL(); img.dataset.source = key;
        await img.decode(); figure.append(img); return figure;
      }
      async function verify(blocks, template = "classic") {
        document.body.replaceChildren();
        const expected = normalize(blocks.map(b => b.textContent).join(""));
        const keys = blocks.flatMap(b => [...b.querySelectorAll("img")].map(i=>i.dataset.source));
        const pages = plugin.paginate(document, blocks, template);
        expect(expected === normalize(pages.map(pg=>pg.textContent).join("")), "Text changed");
        const placed = pages.flatMap(pg=>[...pg.querySelectorAll("img")]);
        expect(JSON.stringify(keys) === JSON.stringify(placed.map(i=>i.dataset.source)), "Image order changed");
        for (const pg of pages) {
          const box = pg.getBoundingClientRect();
          for (const el of pg.children) {
            expect(el.getBoundingClientRect().bottom <= box.bottom - plugin.pageTemplates[template].bottom + .03, "Page overflow");
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
      for (const space of [800, 700, 680, 679]) {
        const fig = await picture(600, 800, "threshold", true);
        const pages = await verify([filler(1284 - 25 - space), fig]);
        expect(pages.length === (space >= 680 ? 1 : 2), "85% boundary at " + space);
        const expectedWidth = space >= 680 ? space * 600 / 800 : 600;
        expect(fig.firstChild.getBoundingClientRect().width === expectedWidth, "Wrong width at " + space);
      }
      for (const fixed of [false, true]) {
        const lead = para("下图展示本次记录。"), tail = para("这些数据用于后续比较。");
        const fig = await picture(600, 1284, "table", true);
        if (fixed) fig.firstChild.dataset.width = "600";
        const pages = await verify([filler(920), lead, fig, tail]);
        expect((lead.parentNode === fig.parentNode) === !fixed, "Lead carry or fixed width");
        expect((fig.firstChild.getBoundingClientRect().width === 600) === fixed, "Image sizing");
      }
      for (const tailHeight of [239, 240]) {
        const fig = await picture(600, 1200, "trailing", true);
        const tail = para("第一行。\n第二行。\n第三行。\n第四行。");
        tail.style.whiteSpace = "pre-line";
        tail.style.lineHeight = tailHeight / 4 + "px";
        await verify([filler(1100), fig, tail]);
        // 1284px of content minus 25px gap leaves 1020px or 1019px for the image.
        expect(fig.firstChild.getBoundingClientRect().width === (tailHeight === 239 ? 510 : 600),
          "Trailing paragraph at " + tailHeight);
      }
      const sample = await picture(800, 540, "配速数据", true, 2);
      for (const percent of [100, 85, 75]) {
        const fig = sample.cloneNode(true);
        await fig.firstChild.decode();
        fig.firstChild.style.width = 800 * percent / 100 + "px";
        const [pg] = await verify([para("分段配速记录"), fig]);
        shots.push(await (await plugin.renderPNG(pg)).arrayBuffer());
      }
      for (let i = 0; i < 16; i++) {
        const source = ["# 随机样本 " + i];
        for (let j = 0; j < 3 + i % 6; j++) {
          if (random(3)) source.push("自动生成的测量记录。".repeat(1 + random(80)));
          source.push("![[附件" + j + ".png" + (j === 0 ? "|360" : "") + "]]");
        }
        const { blocks } = plugin.article(document, source.join("\n\n"), "样本");
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
      const caption = para("图注：清晨步行的分段记录。");
      const wide = await picture(1000, 1100, "暖纸便签配图");
      const fixed = await picture(1200, 760, "指定宽度");
      const tall = await picture(500, 1600, "全页竖图");
      fixed.firstChild.dataset.width = "480";
      for (const figure of [wide, fixed, tall]) plugin.sizePicture(figure.firstChild, "warm");
      const note = [
        "# 在清晨的河岸散步，记下一路留意到的那些小事 👀",
        "出门时天刚亮，沿河的路上还没什么人。昨晚下过雨，石阶旁有几处积水，映出了对岸的树影。我走得比平时慢一些，听见水面上有鸟飞过。",
        "我停在桥下等天色再亮一点。往来的人有的在跑步，有的推着自行车，都没有急着赶路。桥上的风大，底下反而很安静。",
        "沿着原路往回走时，我发现去程没有留意的小花开在栏杆下面。前几天一直忙着赶时间，经过这里时总低头看手机，几乎没认真看过这段路。",
        "快到家时又下起小雨，我绕去街角买了早餐。店里刚开门，柜台上的玻璃还带着一点热气，老板说雨停之后太阳大概就出来了。",
        "回家把这一段写下来。想起那片树影和栏杆下的小花，明早有空的话，还想按今天的速度再走一次。🌿",
      ].join("\n\n");
      const { blocks } = plugin.article(document, note, "样本");
      const warm = await verify(blocks, "warm");
      expect(warm.length === 2, "Warm note should span two pages");
      const [warmTitle, firstPara, secondPara] = warm[0].children;
      expect(getComputedStyle(warmTitle).fontSize === "52px", "Warm title sizing changed");
      expect(getComputedStyle(warmTitle).color === "rgb(98, 82, 65)", "Warm title color changed");
      expect(getComputedStyle(firstPara).fontSize === "42px", "Warm body sizing changed");
      expect(getComputedStyle(firstPara).color === "rgb(102, 87, 73)", "Warm body color changed");
      expect(firstPara.getBoundingClientRect().top - warmTitle.getBoundingClientRect().bottom === 96, "Warm title gap changed");
      expect(secondPara.getBoundingClientRect().top - firstPara.getBoundingClientRect().bottom === 82, "Warm prose gap changed");
      for (const page of warm) {
        const blob = await plugin.renderPNG(page);
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const pixel = canvas.getContext("2d");
        pixel.drawImage(bitmap, 0, 0);
        expect(bitmap.width === 2160 && bitmap.height === 2880, "Warm PNG dimensions changed");
        const colorAt = (x, y) => [...pixel.getImageData(x, y, 1, 1).data].join();
        const frame = "232,228,219,255";
        expect(colorAt(0, 0) === "255,252,247,255", "Warm paper missing from PNG");
        const top = Array.from({length: 10}, (_, i) => colorAt(200, 96 + i) === frame);
        expect(top.filter((painted, i) => painted && !top[i - 1]).length === 2, "Warm double rule missing from PNG");
        expect(colorAt(68, 190) === frame && colorAt(2091, 190) === frame && colorAt(200, 2783) === frame, "Warm frame is incomplete");
        bitmap.close();
        shots.push(await blob.arrayBuffer());
      }
      await verify([filler(1000), wide, caption], "warm");
      expect(wide.parentElement === caption.parentElement, "Warm image lost its caption");
      expect(caption.getBoundingClientRect().top - wide.getBoundingClientRect().bottom === 28, "Warm caption gap changed");
      expect(wide.firstChild.getBoundingClientRect().width <= 872, "Warm image exceeded content width");
      await verify([tall, fixed], "warm");
      expect(fixed.firstChild.getBoundingClientRect().width === 480, "Warm image lost fixed width");
      expect(Math.abs(tall.firstChild.getBoundingClientRect().height - 1220) < .1, "Tall image exceeded warm content height");
      const [classic] = await verify([para("切回经典白底")]);
      expect(getComputedStyle(classic).backgroundColor === "rgb(255, 255, 255)", "Warm styling carried over to classic");
      const story = "# 海边训练日记\n\n## 配速与补给\n\n### 第一圈\n\n- 慢跑热身\n- 沿海往返\n\n> 海风影响配速。\n\n"
        + "第一圈按计划控制强度，记录配速和主观感受。".repeat(45)
        + "\n\n## 路线与照片\n\n![[海边.png]]\n\n图一：折返点。\n\n"
        + "第二圈的路线和第一圈一致。".repeat(30);
      for (const id of Object.keys(plugin.pageTemplates)) {
        const { blocks: storyBlocks } = plugin.article(document, story, "样本");
        const figure = storyBlocks.find(block => block.tagName === "FIGURE");
        const firstPicture = (await picture(800, 630, "训练路线")).firstElementChild;
        firstPicture.dataset.source = "海边.png";
        figure.replaceChildren(firstPicture);
        plugin.sizePicture(firstPicture, id);
        const output = await verify(storyBlocks, id);
        expect(output.length > 1, id + " did not produce a continuation page");
        expect(output.slice(1).every(p => !p.hasAttribute("data-first")), id + " repeated the first-page treatment");
        const title = output[0].querySelector("[data-article-title]");
        const section = output[0].querySelector("h2");
        if (id === "warm") {
          const items = output[0].querySelectorAll("[data-marker]");
          const quote = output[0].querySelector(".quoted");
          expect(items[1].getBoundingClientRect().top - items[0].getBoundingClientRect().bottom === 28, "Warm list gap changed");
          expect(quote.getBoundingClientRect().top - items[1].getBoundingClientRect().bottom === 28, "Warm quote gap changed");
        } else if (id === "column") {
          expect(getComputedStyle(title).backgroundColor === "rgb(41, 36, 81)", "Column title panel missing");
          expect(getComputedStyle(section).borderBottomWidth === "2px", "Column section rule missing");
        } else if (id === "grid") {
          expect(getComputedStyle(output[1]).backgroundImage !== "none", "Grid missing from continuation");
          expect(getComputedStyle(section).backgroundColor === "rgb(224, 233, 212)", "Grid heading highlight missing");
        } else if (id === "outline") {
          expect(getComputedStyle(section).borderLeftWidth === "7px", "Outline section marker missing");
          expect(getComputedStyle(section.nextElementSibling).fontSize === "39px", "Outline H3 sizing missing");
        }
      }

      document.body.replaceChildren();
      const { blocks: continuous } = plugin.article(document, story + "\n\n末尾内容。", "样本");
      const longFigure = continuous.find(block => block.tagName === "FIGURE");
      const longPicture = (await picture(800, 630, "训练路线")).firstElementChild;
      longFigure.replaceChildren(longPicture);
      plugin.sizePicture(longPicture, "warm");
      const marker = filler(24);
      marker.style.background = "#d84c2b";
      continuous.push(marker);
      const expected = continuous.map(block => block.textContent).join("");
      const pending = plugin.renderLongPNG(document, continuous, "warm");
      const longPage = document.querySelector(".pp-long-page");
      const markerY = marker.getBoundingClientRect().top - longPage.getBoundingClientRect().top;
      expect(longPage.textContent === expected, "Long image changed article text");
      expect(Array.from(longPage.children).every((el, i) => el === continuous[i]), "Long image reordered blocks");
      const imageBounds = longPicture.getBoundingClientRect();
      expect(Math.abs(imageBounds.height - imageBounds.width * 630 / 800) < .1, "Long image distorted its picture");
      const single = await pending;
      const pixel = document.createElement("canvas");
      pixel.width = pixel.height = 1;
      const ctx = pixel.getContext("2d");
      const samplePixel = (bitmap, x, y) => {
        ctx.drawImage(bitmap, x, y, 1, 1, 0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data].join();
      };
      const bitmap = await createImageBitmap(single.blob);
      expect(bitmap.width === 2160 && bitmap.height === single.height && bitmap.height > 5760, "Wrong long PNG dimensions");
      expect(samplePixel(bitmap, 500, markerY * 2 + 8) === "216,76,43,255", "Long PNG lost its final block");
      expect(samplePixel(bitmap, 68, Math.floor(bitmap.height / 2)) === "232,228,219,255", "Warm frame interrupted in long PNG");
      expect(samplePixel(bitmap, 200, bitmap.height - 97) === "232,228,219,255", "Warm frame missing at the bottom of long PNG");
      bitmap.close();
      expect(!document.querySelector(".pp-long-page"), "Long measurement page was not removed");

      for (const height of [14000, 27000]) {
        const last = filler(24);
        last.style.background = "#d84c2b";
        const scaled = await plugin.renderLongPNG(document, [filler(height), last], "classic");
        expect(scaled.width >= 1080 && scaled.width < 2160, "Long PNG should scale down proportionally");
        expect(scaled.height <= 30000 && scaled.width * scaled.height <= 48_000_000, "Long PNG exceeded its size budget");
        const bitmap = await createImageBitmap(scaled.blob);
        expect(bitmap.height === scaled.height && bitmap.width === scaled.width, "Scaled PNG dimensions differ from preview");
        const y = Math.floor((height + 78 + 25 + 10) * scaled.height / (height + 78 + 25 + 24 + 78));
        expect(samplePixel(bitmap, 500, y) === "216,76,43,255", "Scaled PNG clipped its final block");
        bitmap.close();
      }
      return shots.map(buffer=>Array.from(new Uint8Array(buffer)));
    });
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "yigao-chengkan-layout-"));
    for (const [i, bytes] of result.entries()) {
      const png = Buffer.from(bytes);
      assert.equal(png.readUInt32BE(16),2160);
      assert.equal(png.readUInt32BE(20),2880);
      await fs.writeFile(path.join(dir, ["100", "85", "75", "warm", "warm-next"][i] + ".png"), png);
    }
    console.log("全部分页用例通过。抽查 PNG：" + dir);
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
