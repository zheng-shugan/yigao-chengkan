import { App, MarkdownView, Modal, Notice, Plugin, requestUrl, TFile, getFrontMatterInfo } from "obsidian";
import { article } from "./article";
import { paginate, renderPNG } from "./layout";
import { writePages } from "./output";

const message = (error: unknown) => error instanceof Error ? error.message : String(error);

async function loadPicture(app: App, file: TFile, source: string): Promise<string> {
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
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 920 / image.naturalWidth, 1284 / image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally { URL.revokeObjectURL(url); }
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
    button.disabled = true;
    const gallery = this.contentEl.createDiv({ cls: "pp-pages" });
    const frame = this.contentEl.createEl("iframe", { cls: "pp-measure" });
    frame.tabIndex = -1;
    frame.setAttribute("aria-hidden", "true");
    try {
      const doc = frame.contentDocument!;
      const source = this.source.slice(getFrontMatterInfo(this.source).contentStart);
      const blocks = article(doc, source, this.file.basename);
      const cache = new Map<string, string>();
      const failures = new Map<string, string>();
      for (const block of blocks) {
        for (const img of block.querySelectorAll("img")) {
          const source = img.dataset.source!;
          if (failures.has(source)) continue;
          try {
            const data = cache.get(source) ?? await loadPicture(this.app, this.file, source);
            if (this.closed) return;
            cache.set(source, data);
            img.src = data;
            await img.decode();
            img.width = img.naturalWidth;
            img.height = img.naturalHeight;
          } catch (e) { failures.set(source, message(e)); }
        }
      }
      if (this.closed) return;
      if (failures.size) {
        status.setText("配图读取失败，请修复后重新生成。");
        const list = gallery.createEl("ul");
        for (const [src, why] of failures) list.createEl("li", { text: src + " · " + why });
        return;
      }
      await doc.fonts.ready;
      if (this.closed) return;
      const pages = paginate(doc, blocks);
      for (const [i, page] of pages.entries()) {
        const blob = await renderPNG(page);
        if (this.closed) return;
        this.blobs.push(blob);
        const url = URL.createObjectURL(blob);
        this.urls.push(url);
        const figure = gallery.createEl("figure");
        figure.createEl("img", { attr: { src: url, alt: "第 " + (i + 1) + " 页" } });
        figure.createEl("figcaption", { text: (i + 1) + " / " + pages.length });
      }
      status.setText("共 " + pages.length + " 页");
      button.disabled = false;
      button.onclick = async () => {
        button.disabled = true;
        try {
          const electron = require("electron");
          const remote = electron.remote ?? require("@electron/remote");
          const result = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
            title: "选择导出文件夹", properties: ["openDirectory", "createDirectory"]
          });
          if (result.canceled || !result.filePaths.length || this.closed) return;
          status.setText("正在导出…");
          const target = await writePages(result.filePaths[0], this.file.basename, this.blobs.slice());
          if (this.closed) return;
          status.setText("已导出 " + pages.length + " 张图片");
          bar.querySelector(".pp-open")?.remove();
          const open = bar.createEl("button", { cls: "pp-open", text: "打开文件夹" });
          open.onclick = async () => {
            const reason = await electron.shell.openPath(target);
            if (reason) new Notice(reason);
          };
        } catch (e) { status.setText("导出失败：" + message(e)); }
        finally { button.disabled = false; }
      };
    } catch (e) { status.setText("排版失败：" + message(e)); }
    finally { frame.remove(); }
  }

  onClose() {
    this.closed = true;
    this.urls.forEach(url => URL.revokeObjectURL(url));
    this.blobs = [];
    this.contentEl.empty();
    this.dispose();
  }
}

export default class PublishPicture extends Plugin {
  private previews = new Set<Preview>();
  onload() {
    const show = async (view: MarkdownView) => {
      const file = view.file;
      if (!file) return;
      try {
        const source = view.getMode() === "source" ? view.editor.getValue() : await this.app.vault.cachedRead(file);
        const modal = new Preview(this.app, file, source, () => this.previews.delete(modal));
        this.previews.add(modal);
        modal.open();
      } catch (e) { new Notice(message(e)); }
    };
    this.addCommand({ id: "export-note", name: "长文一键出图", checkCallback: checking => {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!view?.file) return false;
      if (!checking) void show(view);
      return true;
    } });
    this.registerEvent(this.app.workspace.on("file-menu", (menu, file, _source, leaf) => {
      const view = leaf?.view ?? this.app.workspace.getActiveViewOfType(MarkdownView);
      if (view instanceof MarkdownView && file === view.file) menu.addItem(item =>
        item.setTitle("长文一键出图").setIcon("images").onClick(() => void show(view)));
    }));
  }
  onunload() { for (const preview of this.previews) preview.close(); }
}
