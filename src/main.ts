import { App, MarkdownView, Modal, Notice, Plugin, requestUrl, TFile, getFrontMatterInfo } from "obsidian";
import { article, textArticle } from "./article";
import { defaultTemplate, exportScale, pageTemplates, paginate, pictureBounds, renderPNG, sizePicture, TemplateId } from "./layout";
import { preparePicture, wordArticle, Picture } from "./word";
import { writePages, saveDocument } from "./output";

const message = (error: unknown) => error instanceof Error ? error.message : String(error);

async function readPicture(app: App, file: TFile, source: string) {
  let bytes: ArrayBuffer;
  let type = "";
  if (/^https?:\/\//i.test(source)) {
    const response = await requestUrl(source);
    bytes = response.arrayBuffer;
    type = response.headers["content-type"]?.split(";")[0] || "";
  } else {
    let path = source;
    try { path = decodeURIComponent(path); } catch { /* Literal percent in a vault filename. */ }
    const attachment = app.metadataCache.getFirstLinkpathDest(path, file.path);
    if (!attachment) throw new Error("找不到本地附件");
    bytes = await app.vault.readBinary(attachment);
    type = attachment.extension.toLowerCase() === "svg" ? "image/svg+xml" : "";
  }
  return new Blob([bytes], { type });
}

async function loadPicture(app: App, file: TFile, source: string): Promise<string> {
  const blob = await readPicture(app, file, source);
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const { width, height } = pictureBounds(defaultTemplate);
    const scale = Math.min(1, width * exportScale / image.naturalWidth, height * exportScale / image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally { URL.revokeObjectURL(url); }
}

async function chooseFolder() {
  const electron = require("electron");
  const remote = electron.remote ?? require("@electron/remote");
  return remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    title: "选择导出文件夹", properties: ["openDirectory", "createDirectory"]
  });
}

class Preview extends Modal {
  private closed = false;
  private urls: string[] = [];
  private blobs: Blob[] = [];
  constructor(app: App, private file: TFile, private source: string, private dispose: () => void) { super(app); }

  async onOpen() {
    this.modalEl.addClass("pp-modal");
    this.titleEl.setText("长文一键出图");
    const bar = this.contentEl.createDiv({ cls: "pp-toolbar" });
    const status = bar.createDiv({ cls: "pp-status", text: "正在排版…" });
    status.setAttribute("role", "status");
    const button = bar.createEl("button", { cls: "mod-cta", text: "导出全部" });
    const gallery = this.contentEl.createDiv({ cls: "pp-pages" });
    const picker = this.contentEl.createDiv({ cls: "pp-templates", attr: { role: "group", "aria-label": "图片模板" } });
    const cards = new Map<TemplateId, HTMLButtonElement>();
    for (const id of Object.keys(pageTemplates) as TemplateId[]) {
      const template = pageTemplates[id];
      const card = picker.createEl("button", {
        cls: "pp-template",
        attr: { type: "button", "aria-pressed": String(id === defaultTemplate) },
      });
      const sample = card.createSpan({ cls: "pp-template-sample", attr: { "aria-hidden": "true", "data-template": id } });
      sample.style.setProperty("--pp-paper", template.paper);
      sample.style.setProperty("--pp-ink", template.ink);
      sample.style.setProperty("--pp-accent", template.accent);
      card.createSpan({ text: template.label });
      cards.set(id, card);
    }
    const frame = this.contentEl.createEl("iframe", { cls: "pp-measure" });
    frame.tabIndex = -1;
    frame.setAttribute("aria-hidden", "true");
    let busy = false;
    let activeTemplate: TemplateId | undefined;
    const setBusy = (value: boolean) => {
      busy = value;
      button.disabled = busy || !this.blobs.length;
      for (const card of cards.values()) card.setAttribute("aria-disabled", String(busy));
    };
    const doc = frame.contentDocument!;
    const cache = new Map<string, string>();
    setBusy(true);
    try {
      const blocks = article(doc, this.source, this.file.basename);
      const sources = new Set(blocks.flatMap(block => Array.from(block.querySelectorAll("img"), img => img.dataset.source!)));
      const failures = new Map<string, string>();
      for (const source of sources) {
        try {
          const data = await loadPicture(this.app, this.file, source);
          if (this.closed) return;
          cache.set(source, data);
        } catch (e) { failures.set(source, message(e)); }
        if (this.closed) return;
      }
      if (failures.size) {
        status.setText("配图读取失败，请修复后重新生成。");
        const list = gallery.createEl("ul");
        for (const [src, why] of failures) list.createEl("li", { text: src + " · " + why });
        return;
      }
      const render = async (id: TemplateId) => {
        setBusy(true);
        status.setText("正在排版…");
        const nextUrls: string[] = [];
        try {
          const copies = blocks.map(block => doc.importNode(block, true));
          await Promise.all(copies.flatMap(block => Array.from(block.querySelectorAll("img"), async img => {
            img.src = cache.get(img.dataset.source!)!;
            await img.decode();
            sizePicture(img, id);
          })));
          await doc.fonts.ready;
          if (this.closed) return;
          const pages = paginate(doc, copies, id);
          const blobs: Blob[] = [];
          for (const page of pages) {
            const blob = await renderPNG(page);
            if (this.closed) return;
            blobs.push(blob);
          }
          const figures = blobs.map((blob, i) => {
            const url = URL.createObjectURL(blob);
            nextUrls.push(url);
            const figure = gallery.ownerDocument.createElement("figure");
            figure.createEl("img", { attr: { src: url, alt: "第 " + (i + 1) + " 页" } });
            figure.createEl("figcaption", { text: (i + 1) + " / " + blobs.length });
            return figure;
          });
          gallery.replaceChildren(...figures);
          gallery.scrollTop = 0;
          this.urls.forEach(url => URL.revokeObjectURL(url));
          this.urls = nextUrls;
          this.blobs = blobs;
          activeTemplate = id;
          for (const [key, card] of cards) card.setAttribute("aria-pressed", String(key === id));
          bar.querySelector(".pp-open")?.remove();
          status.setText("共 " + blobs.length + " 页");
        } catch (e) {
          nextUrls.forEach(url => URL.revokeObjectURL(url));
          if (!this.closed) status.setText("排版失败：" + message(e));
        } finally {
          doc.body.replaceChildren();
          if (!this.closed) setBusy(false);
        }
      };
      for (const [id, card] of cards) {
        card.onclick = () => { if (!busy && id !== activeTemplate) void render(id); };
      }
      button.onclick = async () => {
        setBusy(true);
        try {
          const result = await chooseFolder();
          if (result.canceled || !result.filePaths.length || this.closed) return;
          status.setText("正在导出…");
          const target = await writePages(result.filePaths[0], this.file.basename, this.blobs);
          if (this.closed) return;
          status.setText("已导出 " + this.blobs.length + " 张图片");
          bar.querySelector(".pp-open")?.remove();
          const open = bar.createEl("button", { cls: "pp-open", text: "打开文件夹" });
          open.onclick = async () => {
            const reason = await require("electron").shell.openPath(target);
            if (reason) new Notice(reason);
          };
        } catch (e) {
          if (!this.closed) status.setText("导出失败：" + message(e));
        } finally {
          if (!this.closed) setBusy(false);
        }
      };
      await render(defaultTemplate);
    } catch (e) {
      if (!this.closed) status.setText("排版失败：" + message(e));
    }
  }

  onClose() {
    this.closed = true;
    this.urls.forEach(url => URL.revokeObjectURL(url));
    this.urls = [];
    this.blobs = [];
    this.contentEl.empty();
    this.dispose();
  }
}

class TextPreview extends Modal {
  private closed = false;
  private pictures = new Map<string, Picture>();
  constructor(app: App, private file: TFile, private source: string, private dispose: () => void) { super(app); }

  async onOpen() {
    this.modalEl.addClass("pp-modal");
    this.titleEl.setText("发送图文到知乎");
    const { title, body } = textArticle(this.contentEl.ownerDocument, this.source, this.file.basename);
    const bar = this.contentEl.createDiv({ cls: "pp-toolbar" });
    const button = bar.createEl("button", { cls: "mod-cta", text: "生成知乎导入文档" });
    const copy = bar.createEl("button", { text: "复制标题" });
    copy.onclick = () => {
      try { require("electron").clipboard.writeText(title); new Notice("已复制标题"); }
      catch (e) { new Notice("复制失败：" + message(e)); }
    };
    const status = this.contentEl.createDiv({ cls: "pp-text-status", attr: { role: "status" } });
    const preview = this.contentEl.createDiv({ cls: "pp-text-preview" });
    preview.createEl("h1", {text: title});
    preview.append(body);
    const images = Array.from(body.querySelectorAll("img"));
    const prepare = async () => {
      button.disabled = true;
      const failures = [];
      for (const [i, img] of images.entries()) {
        const source = img.dataset.source!;
        try {
          let picture = this.pictures.get(source);
          if (!picture) {
            status.setText("正在读取配图 " + (i + 1) + " / " + images.length);
            picture = await preparePicture(await readPicture(this.app, this.file, source));
            if (this.closed) { URL.revokeObjectURL(picture.url); return; }
            this.pictures.set(source, picture);
          }
          img.src = picture.url;
          img.width = Number(img.dataset.width) || picture.width;
        } catch (e) { failures.push("配图 " + (i + 1) + "：" + source + " · " + message(e)); }
        if (this.closed) return;
      }
      button.disabled = false;
      if (failures.length) {
        status.setText(failures.join("\n"));
        button.setText("重新读取配图");
        button.onclick = prepare;
        return;
      }
      status.setText("在知乎空白文章中选择「导入 → 导入文档」，选取生成的 .docx。");
      button.setText("生成知乎导入文档");
      button.onclick = async () => {
        button.disabled = true;
        try {
          const doc = await wordArticle(body, title, this.pictures);
          if (this.closed) return;
          if (doc.size > 30_000_000) throw new Error("文档超过知乎的 30 MB 限制，请缩小原稿中的配图再生成。");
          const electron = require("electron");
          const remote = electron.remote ?? require("@electron/remote");
          const result = await remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
            title: "保存知乎导入文档", defaultPath: this.file.basename.replace(/[<>:"/\\|?*]/g, "_") + ".docx",
            filters: [{ name: "Word 文档", extensions: ["docx"] }]
          });
          if (this.closed || result.canceled || !result.filePath) return;
          await saveDocument(result.filePath, doc);
          status.setText("已保存 " + result.filePath + "。在知乎空白文章中选择「导入 → 导入文档」。");
        } catch (e) { status.setText("生成失败：" + message(e)); }
        finally { button.disabled = false; }
      };
    };
    await prepare();
  }

  onClose() {
    this.closed = true;
    for (const picture of this.pictures.values()) URL.revokeObjectURL(picture.url);
    this.pictures.clear();
    this.contentEl.empty();
    this.dispose();
  }
}

export default class PublishPicture extends Plugin {
  private previews = new Set<Modal>();
  onload() {
    const show = async (view: MarkdownView, Panel: typeof Preview | typeof TextPreview) => {
      const file = view.file;
      if (!file) return;
      try {
        const source = view.getMode() === "source" ? view.editor.getValue() : await this.app.vault.cachedRead(file);
        const modal: Modal = new Panel(this.app, file, source.slice(getFrontMatterInfo(source).contentStart), () => this.previews.delete(modal));
        this.previews.add(modal);
        modal.open();
      } catch (e) { new Notice(message(e)); }
    };
    const formats = [
      { id: "export-note", name: "长文一键出图", icon: "images", Panel: Preview },
      { id: "copy-zhihu-article", name: "发送图文到知乎", icon: "file-output", Panel: TextPreview }
    ];
    for (const {id, name, Panel} of formats) {
      this.addCommand({ id, name, checkCallback: checking => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view?.file) return false;
        if (!checking) void show(view, Panel);
        return true;
      } });
    }
    this.registerEvent(this.app.workspace.on("file-menu", (menu, file, _source, leaf) => {
      const view = leaf?.view ?? this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!(view instanceof MarkdownView) || file !== view.file) return;
      for (const {name, icon, Panel} of formats) {
        menu.addItem(item => item.setTitle(name).setIcon(icon).onClick(() => void show(view, Panel)));
      }
    }));
  }
  onunload() { for (const preview of this.previews) preview.close(); }
}
