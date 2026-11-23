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
    await page.exposeFunction("renameFile", (p, to) => fs.rename(p, to));
    await page.exposeFunction("unlinkFile", p => fs.unlink(p));
    await page.evaluate(dir => {
      const el = HTMLElement.prototype;
      el.createEl = function(tag, options = {}) {
        const node = document.createElement(tag);
        node.className = options.cls || "";
        node.textContent = options.text || "";
        for (const [name, value] of Object.entries(options.attr || {})) node.setAttribute(name, value);
        this.append(node);
        return node;
      };
      el.createDiv = function(opts) { return this.createEl("div", opts); };
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
          requestUrl: async url => {
            if (url !== "https://example.org/blue.png") throw Error("下载失败");
            return {arrayBuffer: remoteImage, headers: {"content-type":"image/png"}};
          }},
        electron: {clipboard: {writeText: text => window.copied = text},
          remote: {getCurrentWindow() {}, dialog: {showSaveDialog: () => ({filePath: dir + "/article.docx"})}}},
        "node:path": {},
        "node:crypto": {randomUUID: () => "test-temp"},
        "node:fs/promises": {writeFile: (p,b) => window.writeBytes(p, Array.from(b)), rename: window.renameFile, unlink: window.unlinkFile}
      };
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
  } finally { await browser.close(); await fs.rm(dir,{recursive:true,force:true}); }
}
main().catch(e => {console.error(e); process.exitCode = 1;});
