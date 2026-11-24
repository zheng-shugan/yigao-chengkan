const { chromium } = require("playwright-core");
const { build } = require("esbuild");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const {execFileSync} = require("node:child_process");

async function main() {
  const bundle = await build({
    entryPoints: ["src/main.ts"], bundle: true, write: false, format: "iife",
    globalName: "tested", platform: "node", external: ["obsidian", "electron", "@electron/remote", "node:*"]
  });
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "publish-zhihu-"));
  const browser = await chromium.launch({channel: "chrome", executablePath: process.env.CHROME_BIN || undefined});
  try {
    const page = await browser.newPage();
    await page.exposeFunction("writeBytes", (p, bytes) => fs.writeFile(p, Buffer.from(bytes), {flag:"wx"}));
    await page.exposeFunction("makeDir", p => fs.mkdir(p).catch(error => error.code));
    await page.exposeFunction("renameFile", (p, to) => fs.rename(p, to));
    await page.exposeFunction("unlinkFile", p => fs.unlink(p));
    await page.evaluate(dir => {
      const el = HTMLElement.prototype;
      el.createEl = function(tag, options = {}) {
        const node = document.createElement(tag);
        node.className = options.cls || "";
        node.textContent = options.text || "";
        if (options.type) node.type = options.type;
        if (options.value !== undefined) node.value = options.value;
        for (const [name, value] of Object.entries(options.attr || {})) node.setAttribute(name, value);
        if (options.prepend) this.prepend(node);
        else this.append(node);
        return node;
      };
      el.createDiv = function(opts) { return this.createEl("div", opts); };
      el.createSpan = function(opts) { return this.createEl("span", opts); };
      el.setText = function(value) { this.textContent = value; };
      el.addClass = function(cls) { this.classList.add(cls); };
      el.empty = function() { this.replaceChildren(); };
      class Modal {
        constructor(app) {
          this.app = app;
          this.modalEl = document.body.createDiv();
          this.titleEl = this.modalEl.createEl("h2");
          this.contentEl = this.modalEl.createDiv();
        }
        open() { this.onOpen(); }
        close() { this.onClose(); this.modalEl.remove(); }
      }
      class Plugin {
        addCommand(cmd) { window.commands[cmd.id] = cmd; }
        registerEvent() {}
      }
      class MarkdownView {}
      window.testView = new MarkdownView();
      window.commands = {};
      window.imageBytes = encoded => Uint8Array.from(atob(encoded), c => c.charCodeAt(0)).buffer;
      window.localImage = imageBytes("iVBORw0KGgoAAAANSUhEUgAAAKAAAAAyAQMAAADhr0ImAAAAA1BMVEX/OBgdES2aAAAAEklEQVR4nGNgGAWjYBSMAnQAAAQaAAFzaGVZAAAAAElFTkSuQmCC");
      window.remoteImage = imageBytes("iVBORw0KGgoAAAANSUhEUgAAAEYAAABkAQMAAAABhNT6AAAAA1BMVEUgYP/XyP8QAAAAEUlEQVR4nGNgGAWjYBQMdwAAA+gAAbOm00YAAAAASUVORK5CYII=");
      const modules = {
        obsidian: {Plugin, Modal, MarkdownView, Notice: class {}, getFrontMatterInfo: s => ({contentStart: s.match(/^---\n[\s\S]*?\n---\n/)?.[0].length || 0}),
          sanitizeHTMLToDom: html => document.createRange().createContextualFragment(html),
          requestUrl: async url => {
            if (url !== "https://example.org/blue.png") throw Error("下载失败");
            return {arrayBuffer: remoteImage, headers: {"content-type":"image/png"}};
          }},
        electron: {clipboard: {writeText: text => window.copied = text},
          remote: {getCurrentWindow() {}, dialog: {
            showOpenDialog: () => ({filePaths: [dir]}),
            showSaveDialog: () => ({filePath: dir + "/article.docx"}),
          }}},
        "node:path": {join: (...parts) => parts.join("/")},
        "node:crypto": {randomUUID: () => "test-temp"},
        "node:fs/promises": {
          mkdir: async p => {
            const code = await window.makeDir(p);
            if (code) throw Object.assign(new Error(code), {code});
          },
          writeFile: (p,b) => window.writeBytes(p, Array.from(b)), rename: window.renameFile, unlink: window.unlinkFile,
        },
      };
      window.Buffer = {from: data => new Uint8Array(data)};
      window.require = name => modules[name];
    }, dir);
    await page.addScriptTag({content: bundle.outputFiles[0].text});
    await page.evaluate(() => {
      const view = window.testView;
      view.file = {basename:"验收样本", path:"验收样本.md"};
      view.editor = {getValue: () => window.source};
      view.getMode = () => "source";
      window.plugin = new tested.default();
      window.plugin.app = {
        workspace: {getActiveViewOfType: () => view, on() {}},
        metadataCache: {getFirstLinkpathDest: p => p === "缺图.png" ? null : ({ path:p, extension:p.split(".").pop() })},
        vault: {readBinary: f => f.path === "损坏.png" ? new ArrayBuffer(2) : localImage}
      };
      plugin.onload();
    });
    const open = async source => page.evaluate(s => {
      plugin.onunload();
      window.source = s;
      commands["copy-zhihu-article"].checkCallback(false);
    }, source);
    const click = label => page.getByRole("button", {name: label, exact: true}).click();
    const save = async () => {
      await click("生成知乎导入文档");
      await page.getByText(/已保存 |生成失败/).waitFor({timeout: 5000});
      assert.match(await page.locator(".pp-text-status").innerText(), /已保存 /);
      return execFileSync("unzip", ["-p", path.join(dir,"article.docx"), "word/document.xml"], {encoding:"utf8"});
    };
    await open("---\ntags: private\n---\n第一段。\n\n第二段。");
    await click("复制标题");
    assert.equal(await page.evaluate(() => copied), "验收样本");
    let xml = await save();
    assert.match(xml,/第一段。[\s\S]*第二段。/);
    assert.doesNotMatch(xml,/private|<w:drawing>/);
    await open("![[一.png]]");
    assert.equal((await save()).match(/<w:drawing>/g).length, 1);
    await open("# 图文分发验收\n\n## 准备材料\n\n1. 整理**原稿**\n   - 对照*资料*\n\n> 引用示例。\n\n参见[示例网站](https://example.org/)和[[内部/参考|记录]]。\n\n![[本地/红.png|120]]\n\n图一：红色横条。\n\n- 核对第二张图。\n\n![蓝](https://example.org/blue.png)\n\n图二：蓝色竖条。\n\n![[本地/红.png]]\n\n图三：再次出现的红色横条。");
    const firstPicture = page.locator(".pp-text-preview img").first();
    await firstPicture.locator("xpath=self::*[@src]").waitFor();
    assert.equal(await firstPicture.getAttribute("width"), "120");
    assert.equal(await page.locator(".pp-text-preview a").getAttribute("href"), "https://example.org/");
    await click("复制标题");
    assert.equal(await page.evaluate(() => copied), "图文分发验收");
    xml = await save();
    assert.match(xml,/w:hyperlink/);
    assert.match(xml,/w:numPr/);
    assert.doesNotMatch(xml,/图文分发验收|内部\/|【配图/);
    assert.match(xml,/<w:drawing>[\s\S]*图一：[\s\S]*核对第二张图。[\s\S]*<w:drawing>[\s\S]*图二：[\s\S]*<w:drawing>[\s\S]*图三：/);
    const embedded = [...xml.matchAll(/r:embed="([^"]+)"/g)].map(m => m[1]);
    assert.equal(embedded.length,3);
    const rels = execFileSync("unzip", ["-p",path.join(dir,"article.docx"),"word/_rels/document.xml.rels"],{encoding:"utf8"});
    const media = embedded.map(id => rels.match(new RegExp('Id="' + id + '"[^>]*Target="([^"]+)"'))[1]);
    assert.equal(media[0], media[2]);
    assert.notEqual(media[0], media[1]);
    for (const [i,key] of ["localImage","remoteImage"].entries()) {
      const bytes = execFileSync("unzip", ["-p",path.join(dir,"article.docx"),"word/"+media[i]]);
      assert.deepEqual([...bytes], await page.evaluate(k=>Array.from(new Uint8Array(window[k])),key));
    }
    await open(Array(20).fill("![[一.png]]").join("\n\n"));
    assert.equal((await save()).match(/<w:drawing>/g).length,20);
    await open("![[缺图.png]]\n\n![[损坏.png]]\n\n![](https://example.org/missing)");
    await page.getByRole("button",{name:"重新读取配图"}).waitFor();
    assert.equal(await page.getByText("生成知乎导入文档").count(),0);
    const failures = await page.locator(".pp-text-status").innerText();
    assert.match(failures,/配图 1：缺图.png/);
    assert.match(failures,/配图 2：损坏.png/);
    assert.match(failures,/配图 3：https:.*下载失败/);
    await open("![[缺图.png]]");
    await page.evaluate(() => plugin.app.metadataCache.getFirstLinkpathDest = p => ({path:p,extension:"png"}));
    await click("重新读取配图");
    assert.equal((await save()).match(/<w:drawing>/g).length,1);
    console.log("知乎 DOCX 用例通过：纯文字、单图、20 图、本地和网络图、重复引用、损坏和重试。");
    await verifyCovers(page, dir);
  } finally { await browser.close(); await fs.rm(dir,{recursive:true,force:true}); }
}

async function verifyCovers(page, dir) {
  const title = "Obsidian 笔记，怎么排成小红书图文？";
  const open = async source => page.evaluate(s => {
    plugin.onunload();
    window.source = s;
    commands["export-note"].checkCallback(false);
  }, source);
  await page.addStyleTag({path: "styles.css"});
  await open("# " + title + "\n\n## 准备工作\n\n![[一.png]]\n\n![蓝](https://example.org/blue.png)\n\n" + "校对正文分页。".repeat(240));
  const exportButton = page.getByRole("button", {name: "导出全部"});
  const toggle = page.getByRole("checkbox", {name: "添加封面"});
  const selectTemplate = name => page.getByRole("button", {name, exact:true}).click();
  const cover = page.locator(".pp-cover-preview img[src]");
  const body = page.locator(".pp-pages figure:not(.pp-cover-preview) img");
  const heading = page.getByRole("textbox", {name: "封面标题"});
  const subtitle = page.getByRole("textbox", {name: "副标题（可选）"});
  const choice = page.getByRole("combobox", {name: "封面配图"});
  const localInput = page.locator('.pp-cover-images input[type="file"]');
  const ready = () => page.waitForFunction(() => document.querySelector(".pp-toolbar .mod-cta")?.disabled === false);
  const sources = () => body.evaluateAll(images => images.map(image => image.src));
  const previewBytes = async image => Buffer.from(await image.evaluate(async el => {
    const blob = await (await fetch(el.src)).blob();
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });
  }), "base64");
  const exportPages = async () => {
    await exportButton.click();
    await page.getByRole("button", {name: "打开文件夹"}).waitFor();
  };

  await ready();
  assert.equal(await toggle.isChecked(), false);
  const bodySources = await sources();
  assert.ok(bodySources.length > 1);
  const bodyFirst = await previewBytes(body.first());
  await toggle.check();
  await ready();
  assert.equal(await heading.inputValue(), title);
  assert.equal(await page.locator('.pp-cover-templates [aria-pressed="true"]').innerText(), "大字标题");
  await subtitle.fill("从 Markdown 到分页图片");
  await ready();
  const statement = await previewBytes(cover);
  assert.equal(statement.readUInt32BE(16), 2160);
  assert.equal(statement.readUInt32BE(20), 2880);
  assert.equal(await page.locator(".pp-pages img").first().getAttribute("alt"), "封面");
  await exportPages();
  const withCover = path.join(dir, "验收样本");
  assert.deepEqual(await fs.readFile(path.join(withCover, "001.png")), statement);
  assert.deepEqual(await fs.readFile(path.join(withCover, "002.png")), bodyFirst);

  await selectTemplate("截图导读");
  await ready();
  assert.equal(await choice.inputValue(), "0");
  const screenshot = await previewBytes(cover);
  await choice.selectOption("1");
  await ready();
  assert.notDeepEqual(await previewBytes(cover), screenshot);
  await selectTemplate("杂志图封");
  await ready();
  assert.equal(await choice.inputValue(), "1");
  assert.equal(await heading.inputValue(), title);
  assert.equal(await subtitle.inputValue(), "从 Markdown 到分页图片");
  assert.notDeepEqual(await previewBytes(cover), screenshot);

  for (const longTitle of ["特别长的封面标题".repeat(20), "unbrokenword".repeat(35)]) {
    await heading.fill(longTitle);
    await page.getByText("标题太长，请缩短到三行以内。").waitFor();
    assert.equal(await exportButton.isDisabled(), true);
    assert.equal(await cover.count(), 0);
  }
  await heading.fill(title);
  await ready();
  await localInput.setInputFiles({name: "损坏.png", mimeType: "image/png", buffer: Buffer.from("broken")});
  await page.getByText("无法读取这张封面配图，请重新选图。").waitFor();
  assert.equal(await exportButton.isDisabled(), true);
  const png = Buffer.from(await page.evaluate(() => Array.from(new Uint8Array(localImage))));
  await localInput.setInputFiles({name: "封面专用.png", mimeType: "image/png", buffer: png});
  await ready();
  assert.equal(await choice.locator("option:checked").innerText(), "封面专用.png");
  assert.deepEqual(await sources(), bodySources);

  // Hold a local decode in flight, then switch template before it finishes.
  await page.evaluate(() => {
    const decode = Image.prototype.decode;
    Image.prototype.decode = async function () {
      Image.prototype.decode = decode;
      await new Promise(resolve => { window.releaseCoverDecode = resolve; });
      try { await decode.call(this); }
      finally { window.coverDecodeFinished = true; }
    };
  });
  await localInput.setInputFiles({name: "慢图.png", mimeType: "image/png", buffer: png});
  await page.waitForFunction(() => !!window.releaseCoverDecode);
  assert.equal(await exportButton.isDisabled(), true);
  await selectTemplate("大字标题");
  await ready();
  const current = await cover.getAttribute("src");
  await page.evaluate(() => window.releaseCoverDecode());
  await page.waitForFunction(() => window.coverDecodeFinished);
  assert.equal(await cover.getAttribute("src"), current);
  assert.deepEqual(await previewBytes(cover), statement);
  assert.deepEqual(await sources(), bodySources);

  await toggle.uncheck();
  await exportPages();
  const withoutCover = path.join(dir, "验收样本 (2)");
  assert.deepEqual(await fs.readFile(path.join(withoutCover, "001.png")), bodyFirst);
  assert.equal((await fs.readdir(withoutCover)).length, bodySources.length);

  await open("只有正文，标题使用文件名。");
  await ready();
  assert.equal(await toggle.isChecked(), false);
  await toggle.check();
  await ready();
  assert.equal(await heading.inputValue(), "验收样本");
  await selectTemplate("截图导读");
  await page.getByText("请选择一张封面配图。").waitFor();
  assert.equal(await exportButton.isDisabled(), true);
  await localInput.setInputFiles({name: "纯文字笔记的封面.png", mimeType:"image/png", buffer:png});
  await ready();
  const localCover = await cover.getAttribute("src");
  const classicPages = await sources();
  await selectTemplate("暖纸便签");
  await ready();
  assert.equal(await cover.getAttribute("src"), localCover);
  assert.notDeepEqual(await sources(), classicPages);
  await open("---\nauthor: 排除属性\n---\n# 排除标题77\n\n汉字 AB 123，😀。\n\n![[private.png]]\n\n## 小节\n\n- 数字9");
  await ready();
  const cards = page.getByRole("group", {name:"正文模板"}).getByRole("button");
  assert.equal(await cards.count(), 5);
  assert.equal(await cards.locator(".pp-template-sample").count(), 10);
  await toggle.check();
  await ready();
  const author = page.getByRole("textbox", {name:"作者（可选）"});
  const reading = page.getByRole("checkbox", {name:"显示字数与预计阅读时间"});
  assert.equal(await reading.isChecked(), false);
  await page.evaluate(() => {
    const frame = document.querySelector(".pp-cover-editor iframe").contentDocument;
    new MutationObserver(changes => {
      const added = changes.flatMap(change => Array.from(change.addedNodes));
      const cover = added.find(node => node.classList?.contains("cover"));
      if (cover) window.latestMetadata = [...cover.querySelectorAll(".cover-meta span")].map(span => span.textContent);
    }).observe(frame.body, {childList:true});
  });
  const name = "跑".repeat(19) + "👨‍👩‍👧‍👦";
  await author.fill(name);
  await reading.check();
  await ready();
  assert.deepEqual(await page.evaluate(() => latestMetadata), [name, "12 字 · 预计 1 分钟"]);
  await author.fill(name + "者");
  await page.getByText("作者最多输入 20 个字符。").waitFor();
  assert.equal(await exportButton.isDisabled(), true);
  await author.fill("海边跑者");
  await selectTemplate("柿红");
  await ready();
  const customStatement = await previewBytes(cover);

  await selectTemplate("全幅照片");
  await ready();
  assert.equal(await author.inputValue(), "海边跑者");
  assert.equal(await reading.isChecked(), true);
  assert.equal(await choice.inputValue(), "0");
  const xCrop = page.getByRole("combobox", {name:"水平裁切"});
  const yCrop = page.getByRole("combobox", {name:"垂直裁切"});
  assert.equal(await xCrop.inputValue(), "center");
  assert.equal(await yCrop.inputValue(), "center");
  const bands = async wide => Buffer.from(await page.evaluate(wide => {
    const canvas = document.createElement("canvas");
    canvas.width = wide ? 600 : 150;
    canvas.height = wide ? 150 : 600;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0000ff";
    if (wide) ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height);
    else ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
    return canvas.toDataURL().split(",")[1];
  }, wide), "base64");
  const topPixel = () => cover.evaluate(async img => {
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 1000, 120, 1, 1, 0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data];
  });
  for (const [wide, control, first, last] of [[true, xCrop, "left", "right"], [false, yCrop, "top", "bottom"]]) {
    await localInput.setInputFiles({name: "裁切.png", mimeType:"image/png", buffer:await bands(wide)});
    await control.selectOption(first);
    await ready();
    assert.deepEqual(await topPixel(), [255, 0, 0, 255]);
    await control.selectOption(last);
    await ready();
    assert.deepEqual(await topPixel(), [0, 0, 255, 255]);
  }
  await selectTemplate("暮蓝");
  await ready();
  await selectTemplate("截图导读");
  await ready();
  assert.equal(await xCrop.isVisible(), false);
  await selectTemplate("大字标题");
  await ready();
  assert.deepEqual(await previewBytes(cover), customStatement);
  assert.equal(await page.getByRole("button", {name:"柿红"}).getAttribute("aria-pressed"), "true");
  await selectTemplate("全幅照片");
  await selectTemplate("棕影");
  await selectTemplate("暮蓝");
  await ready();
  assert.equal(await xCrop.inputValue(), "right");
  assert.equal(await yCrop.inputValue(), "bottom");
  const latest = await previewBytes(cover);
  assert.equal(latest.readUInt32BE(16), 2160);
  assert.equal(latest.readUInt32BE(20), 2880);
  await exportPages();
  assert.deepEqual(await fs.readFile(path.join(dir, "验收样本 (3)", "001.png")), latest);
  console.log("封面用例通过：四个模板、配色、作者与字数、横竖图裁切、并发切换及导出顺序。");
}

main().catch(e => {console.error(e); process.exitCode = 1;});
