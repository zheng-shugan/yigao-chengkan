import { coverTemplates, CoverTemplateId, defaultCoverTemplate, renderCover } from "./cover";

export class CoverEditor {
  private revision = 0;
  private timer?: number;
  private blob?: Blob;
  private url?: string;
  private template = defaultCoverTemplate;
  private readonly fieldset: HTMLFieldSetElement;
  private readonly toggle: HTMLInputElement;

  constructor(
    host: HTMLElement, gallery: HTMLElement, initialTitle: string, pictures: ReadonlyMap<string, string>,
    prepareLocalPicture: (file: File) => Promise<string>, changed: () => void,
  ) {
    const view = host.ownerDocument.defaultView!;
    const fieldset = this.fieldset = host.createEl("fieldset", { cls: "pp-cover-editor" });
    const enableLabel = fieldset.createEl("label", { cls: "pp-cover-toggle" });
    const enabled = this.toggle = enableLabel.createEl("input", { type: "checkbox" });
    enableLabel.createSpan({ text: "添加封面" });
    const controls = fieldset.createDiv({ cls: "pp-cover-controls" });
    controls.hidden = true;
    const picker = controls.createDiv({ cls: "pp-cover-templates", attr: { role: "group", "aria-label": "封面模板" } });
    const cards = new Map<CoverTemplateId, HTMLButtonElement>();
    for (const id of Object.keys(coverTemplates) as CoverTemplateId[]) {
      const card = picker.createEl("button", {
        cls: "pp-template", attr: { type: "button", "aria-pressed": String(id === this.template) },
      });
      const sample = card.createSpan({ cls: "pp-cover-sample", attr: { "aria-hidden": "true", "data-cover": id } });
      sample.createSpan();
      card.createSpan({ text: coverTemplates[id].label });
      cards.set(id, card);
    }
    const fields = controls.createDiv({ cls: "pp-cover-fields" });
    const titleLabel = fields.createEl("label", { text: "封面标题" });
    const title = titleLabel.createEl("textarea", { attr: { rows: "2" } });
    title.value = initialTitle;
    const subtitleLabel = fields.createEl("label", { text: "副标题（可选）" });
    const subtitle = subtitleLabel.createEl("textarea", { attr: { rows: "2" } });
    const imageControls = controls.createDiv({ cls: "pp-cover-images" });
    imageControls.hidden = true;
    const imageLabel = imageControls.createEl("label", { text: "封面配图" });
    const imageChoice = imageLabel.createEl("select", { cls: "dropdown" });
    imageChoice.createEl("option", { text: "选择笔记配图…", value: "", attr: { disabled: "" } });
    const sources = Array.from(pictures.keys());
    for (const [i, source] of sources.entries()) {
      imageChoice.createEl("option", { text: source, value: String(i) });
    }
    imageChoice.value = sources.length ? "0" : "";
    const local = imageControls.createEl("input", { type: "file", attr: { accept: "image/*", hidden: "" } });
    const browse = imageControls.createEl("button", { text: "选择本地图片…", attr: { type: "button" } });
    const status = controls.createDiv({ cls: "pp-cover-status", attr: { role: "status" } });
    const frame = fieldset.createEl("iframe", { cls: "pp-measure", attr: { "aria-hidden": "true", tabindex: "-1" } });

    const figure = gallery.createEl("figure", { cls: "pp-cover-preview", prepend: true });
    figure.hidden = true;
    const canvas = figure.createDiv({ cls: "pp-cover-canvas" });
    const preview = canvas.createEl("img", { attr: { alt: "封面" } });
    figure.createEl("figcaption", { text: "封面" });

    let localFile: File | undefined;
    let localOption: HTMLOptionElement | undefined;
    let localImage: Promise<string> | undefined;
    const update = () => {
      const revision = ++this.revision;
      view.clearTimeout(this.timer);
      this.clearPreview();
      figure.hidden = !enabled.checked;
      preview.removeAttribute("src");
      changed();

      if (!enabled.checked) {
        status.setText("");
        return;
      }
      const template = this.template;
      const hasImage = coverTemplates[template].image;
      const selection = imageChoice.value;
      const file = selection === "local" ? localFile : undefined;
      const content = {
        template, title: title.value, subtitle: subtitle.value,
        image: hasImage && selection && !file ? pictures.get(sources[Number(selection)]) : undefined,
      };
      status.setText("正在生成封面…");
      this.timer = view.setTimeout(async () => {
        try {
          if (hasImage && file) {
            try {
              localImage ??= prepareLocalPicture(file);
              content.image = await localImage;
            } catch {
              throw new Error("无法读取这张封面配图，请重新选图。");
            }
          }
          if (revision !== this.revision) return;
          const blob = await renderCover(frame.contentDocument!, content);
          if (revision !== this.revision) return;
          this.url = URL.createObjectURL(blob);
          this.blob = blob;
          preview.src = this.url;
          status.setText("");
        } catch (error) {
          if (revision !== this.revision) return;
          status.setText(error instanceof Error ? error.message : "封面生成失败，请重新选择模板。");
        }
        changed();
      }, 120);
    };

    enabled.onchange = () => {
      controls.hidden = !enabled.checked;
      if (enabled.checked) gallery.scrollTop = 0;
      update();
    };
    for (const [id, card] of cards) {
      card.onclick = () => {
        if (id === this.template) return;
        this.template = id;
        for (const [key, option] of cards) option.setAttribute("aria-pressed", String(key === id));
        imageControls.hidden = !coverTemplates[id].image;
        gallery.scrollTop = 0;
        update();
      };
    }
    title.oninput = subtitle.oninput = imageChoice.onchange = update;
    browse.onclick = () => local.click();
    local.onchange = () => {
      const file = local.files?.[0];
      if (!file) return;
      local.value = "";
      localFile = file;
      localImage = undefined;
      localOption ??= imageChoice.createEl("option", { value: "local" });
      localOption.setText(file.name);
      imageChoice.value = "local";
      gallery.scrollTop = 0;
      update();
    };
  }

  get ready() { return !this.toggle.checked || !!this.blob; }
  get image() { return this.blob; }

  setLocked(locked: boolean) {
    this.fieldset.disabled = locked;
  }

  dispose() {
    this.revision++;
    this.fieldset.ownerDocument.defaultView?.clearTimeout(this.timer);
    this.clearPreview();
  }

  private clearPreview() {
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = undefined;
    this.blob = undefined;
  }
}
