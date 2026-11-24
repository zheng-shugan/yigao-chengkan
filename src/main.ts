import { App, MarkdownView, Modal, Notice, Plugin, TFile, getFrontMatterInfo } from "obsidian";
import { article } from "./article";
import { defaultTemplate, exportScale, pageHeight, pageTemplates, pageWidth, paginate, pictureBounds, renderLongPNG, renderPNG, sizePicture, TemplateId } from "./layout";
import { CoverEditor } from "./cover-editor";
import { PreviewWorkspace } from "./preview-workspace";
import { readPicture } from "./pictures";
import { safeFileName, saveFile, writePages } from "./output";

const brandName = "一稿成刊";
const message = (error: unknown) => error instanceof Error ? error.message : String(error);

async function pictureDataURL(blob: Blob, width: number, height: number): Promise<string> {
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
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

async function chooseLongImage(basename: string) {
  const electron = require("electron");
  const remote = electron.remote ?? require("@electron/remote");
  return remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
    title: "保存整篇长图", defaultPath: safeFileName(basename) + "-长图.png",
    filters: [{ name: "PNG 图片", extensions: ["png"] }],
  });
}

const exportModes = { pages: "分页图片", long: "整篇长图" };
type ExportMode = keyof typeof exportModes;

class Preview extends Modal {
  private closed = false;
  private urls: string[] = [];
  private blobs: Blob[] = [];
  private cover?: CoverEditor;
  constructor(app: App, private file: TFile, private source: string, private dispose: () => void) { super(app); }

  async onOpen() {
    this.modalEl.classList.add("pp-modal", "pp-workspace-modal");
    this.titleEl.setText(brandName + "（Draft to Pages）");
    const bar = this.contentEl.createDiv({ cls: "pp-toolbar" });
    const modePicker = bar.createDiv({ cls: "pp-export-modes", attr: { role: "group", "aria-label": "导出模式" } });
    const modeButtons = new Map<ExportMode, HTMLButtonElement>();
    for (const mode of Object.keys(exportModes) as ExportMode[]) {
      const control = modePicker.createEl("button", {
        text: exportModes[mode], attr: { type: "button", "aria-pressed": String(mode === "pages") },
      });
      modeButtons.set(mode, control);
    }
    const status = bar.createDiv({ cls: "pp-status", text: "正在排版…" });
    status.setAttribute("role", "status");
    const button = bar.createEl("button", { cls: "mod-cta", text: "导出全部" });
    const workspace = new PreviewWorkspace(this.contentEl, bar);
    const picker = workspace.templates.createDiv({ cls: "pp-templates", attr: { role: "group", "aria-label": "正文模板" } });
    const cards = new Map<TemplateId, HTMLButtonElement>();
    for (const id of Object.keys(pageTemplates) as TemplateId[]) {
      const template = pageTemplates[id];
      const card = picker.createEl("button", {
        cls: "pp-template",
        attr: { type: "button", "aria-pressed": String(id === defaultTemplate) },
      });
      const samples = card.createSpan({ cls: "pp-template-samples", attr: { "aria-hidden": "true" } });
      samples.style.setProperty("--pp-paper", template.paper);
      samples.style.setProperty("--pp-ink", template.ink);
      samples.style.setProperty("--pp-accent", template.accent);
      for (const page of ["first", "next"]) {
        samples.createSpan({ cls: "pp-template-sample", attr: { "data-template": id, "data-page": page } });
      }
      card.createSpan({ text: template.label });
      cards.set(id, card);
    }
    const frame = this.contentEl.createEl("iframe", { cls: "pp-measure" });
    frame.tabIndex = -1;
    frame.setAttribute("aria-hidden", "true");
    let busy = false;
    let template = defaultTemplate;
    let mode: ExportMode = "pages";
    let longSize = "";
    const refreshExport = () => {
      button.disabled = busy || !this.blobs.length || (mode === "pages" && this.cover?.ready === false);
    };
    const setBusy = (value: boolean) => {
      busy = value;
      refreshExport();
      for (const control of modeButtons.values()) control.disabled = value;
      for (const card of cards.values()) card.setAttribute("aria-disabled", String(busy));
    };
    const doc = frame.contentDocument!;
    const cache = new Map<string, string>();
    setBusy(true);
    try {
      const { title, blocks, wordCount } = article(doc, this.source, this.file.basename);
      const sources = new Set(blocks.flatMap(block => Array.from(block.querySelectorAll("img"), img => img.dataset.source!)));
      const failures = new Map<string, string>();
      const { width, height } = pictureBounds(defaultTemplate);
      for (const source of sources) {
        try {
          const data = await pictureDataURL(await readPicture(this.app, this.file, source), width, height);
          if (this.closed) return;
          cache.set(source, data);
        } catch (e) { failures.set(source, message(e)); }
        if (this.closed) return;
      }
      if (failures.size) {
        status.setText("配图读取失败，请修复后重新生成。");
        const list = workspace.stage.createEl("ul", { cls: "pp-preview-errors" });
        for (const [src, why] of failures) list.createEl("li", { text: src + " · " + why });
        return;
      }
      const cover = this.cover = new CoverEditor(
        workspace.coverSettings, this.contentEl, { title, wordCount }, cache, file => pictureDataURL(file, pageWidth, pageHeight), feedback => {
          workspace.setCover(cover.enabled, cover.previewURL, feedback);
          if (mode === "long") return;
          const open = bar.querySelector(".pp-open");
          if (open) {
            open.remove();
            status.setText("共 " + this.blobs.length + " 页正文");
          }
          refreshExport();
        },
      );
      const render = async () => {
        setBusy(true);
        workspace.stage.setAttribute("aria-busy", "true");
        bar.querySelector(".pp-open")?.remove();
        status.setText("正在排版…");
        const nextUrls: string[] = [];
        try {
          const copies = blocks.map(block => doc.importNode(block, true));
          await Promise.all(copies.flatMap(block => Array.from(block.querySelectorAll("img"), async img => {
            img.src = cache.get(img.dataset.source!)!;
            await img.decode();
            sizePicture(img, template);
          })));
          await doc.fonts.ready;
          if (this.closed) return;
          const blobs: Blob[] = [];
          if (mode === "long") {
            const { blob, width, height } = await renderLongPNG(doc, copies, template);
            if (this.closed) return;
            blobs.push(blob);
            longSize = width + " × " + height + " px";
          } else {
            for (const page of paginate(doc, copies, template)) {
              const blob = await renderPNG(page);
              if (this.closed) return;
              blobs.push(blob);
            }
          }
          for (const blob of blobs) nextUrls.push(URL.createObjectURL(blob));
          workspace.setImages(nextUrls, mode === "long");
          this.clearPages();
          this.urls = nextUrls;
          this.blobs = blobs;
          status.setText(mode === "long" ? longSize : "共 " + blobs.length + " 页正文");
        } catch (e) {
          nextUrls.forEach(url => URL.revokeObjectURL(url));
          workspace.setImages([], mode === "long");
          this.clearPages();
          if (!this.closed) status.setText("排版失败：" + message(e));
        } finally {
          doc.body.replaceChildren();
          if (!this.closed) {
            workspace.stage.setAttribute("aria-busy", "false");
            setBusy(false);
          }
        }
      };
      for (const [id, card] of cards) {
        card.onclick = () => {
          if (busy || (id === template && this.blobs.length)) return;
          template = id;
          for (const [key, option] of cards) option.setAttribute("aria-pressed", String(key === id));
          void render();
        };
      }
      for (const [id, control] of modeButtons) {
        control.onclick = () => {
          if (busy || id === mode) return;
          mode = id;
          workspace.setMode(id === "long");
          button.setText(id === "long" ? "导出长图" : "导出全部");
          for (const [key, option] of modeButtons) option.setAttribute("aria-pressed", String(key === id));
          void render();
        };
      }
      button.onclick = async () => {
        if (button.disabled) return;
        setBusy(true);
        cover.setLocked(true);
        try {
          let target: string;
          if (mode === "long") {
            const result = await chooseLongImage(this.file.basename);
            if (result.canceled || !result.filePath || this.closed) return;
            target = result.filePath;
            status.setText("正在导出…");
            await saveFile(target, this.blobs[0]);
            if (this.closed) return;
            status.setText("已导出长图 · " + longSize);
          } else {
            const pages = cover.image ? [cover.image, ...this.blobs] : this.blobs;
            const result = await chooseFolder();
            if (result.canceled || !result.filePaths.length || this.closed) return;
            status.setText("正在导出…");
            target = await writePages(result.filePaths[0], this.file.basename, pages);
            if (this.closed) return;
            status.setText("已导出 " + pages.length + " 张图片");
          }
          bar.querySelector(".pp-open")?.remove();
          const open = bar.createEl("button", { cls: "pp-open", text: "打开文件夹" });
          open.onclick = async () => {
            const shell = require("electron").shell;
            if (mode === "long") {
              shell.showItemInFolder(target);
              return;
            }
            const reason = await shell.openPath(target);
            if (reason) new Notice(reason);
          };
        } catch (e) {
          if (!this.closed) status.setText("导出失败：" + message(e));
        } finally {
          if (!this.closed) {
            cover.setLocked(false);
            setBusy(false);
          }
        }
      };
      await render();
    } catch (e) {
      if (!this.closed) status.setText("排版失败：" + message(e));
    }
  }

  onClose() {
    this.closed = true;
    this.cover?.dispose();
    this.clearPages();
    this.contentEl.empty();
    this.dispose();
  }

  private clearPages() {
    this.urls.forEach(url => URL.revokeObjectURL(url));
    this.urls = [];
    this.blobs = [];
  }
}

export default class YigaoChengkan extends Plugin {
  private previews = new Set<Modal>();
  onload() {
    const show = async (view: MarkdownView) => {
      const file = view.file;
      if (!file) return;
      try {
        const source = view.getMode() === "source" ? view.editor.getValue() : await this.app.vault.cachedRead(file);
        const modal: Modal = new Preview(this.app, file, source.slice(getFrontMatterInfo(source).contentStart), () => this.previews.delete(modal));
        this.previews.add(modal);
        modal.open();
      } catch (e) { new Notice(message(e)); }
    };
    this.addCommand({ id: "export-note", name: "打开预览", checkCallback: checking => {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!view?.file) return false;
      if (!checking) void show(view);
      return true;
    } });
    this.registerEvent(this.app.workspace.on("file-menu", (menu, file, _source, leaf) => {
      const view = leaf?.view ?? this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!(view instanceof MarkdownView) || file !== view.file) return;
      menu.addItem(item => item.setTitle(brandName).setIcon("images").onClick(() => void show(view)));
    }));
  }
  onunload() { for (const preview of this.previews) preview.close(); }
}
