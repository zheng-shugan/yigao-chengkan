import { App, Modal, Notice, TFile } from "obsidian";
import { textArticle } from "./article";
import { saveFile } from "./output";
import { readPicture } from "./pictures";
import { preparePicture, wordArticle, Picture } from "./word";

const message = (error: unknown) => error instanceof Error ? error.message : String(error);

// Kept available for tests while the Zhihu export is paused in the plugin.
export class TextPreview extends Modal {
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
          await saveFile(result.filePath, doc);
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
