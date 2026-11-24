type SettingsPanel = "template" | "cover";

let workspaceCount = 0;

export class PreviewWorkspace {
  readonly templates: HTMLElement;
  readonly coverSettings: HTMLElement;
  readonly stage: HTMLElement;

  private readonly coverTab: HTMLButtonElement;
  private readonly image: HTMLImageElement;
  private readonly coverFeedback: HTMLElement;
  private readonly zoom: HTMLButtonElement;
  private readonly navigation: HTMLElement;
  private readonly thumbnails: HTMLElement;
  private readonly previous: HTMLButtonElement;
  private readonly next: HTMLButtonElement;
  private readonly count: HTMLElement;
  private readonly showTemplateSettings: () => void;
  private pageButtons: HTMLButtonElement[] = [];
  private coverButton?: HTMLButtonElement;
  private urls: string[] = [];
  private coverEnabled = false;
  private coverURL?: string;
  private coverMessage?: string;
  private page = 0;
  private viewingCover = false;
  private longMode = false;
  private renderedLong = false;
  private fitWidth = false;

  constructor(host: HTMLElement, toolbar: HTMLElement) {
    const id = ++workspaceCount;
    const settingsId = "pp-settings-" + id;
    const opener = toolbar.createEl("button", {
      cls: "pp-settings-open", text: "设置",
      attr: { type: "button", "aria-controls": settingsId, "aria-expanded": "false" },
    });
    const workspace = host.createDiv({ cls: "pp-workspace" });
    const viewer = workspace.createDiv({ cls: "pp-viewer" });
    const tools = viewer.createDiv({ cls: "pp-view-tools" });
    this.zoom = tools.createEl("button", {
      cls: "pp-preview-zoom", text: "适合宽度", attr: { type: "button" },
    });
    this.zoom.onclick = () => {
      this.fitWidth = !this.fitWidth;
      this.refreshImage(true);
    };
    this.stage = viewer.createDiv({ cls: "pp-stage", attr: { tabindex: "0", role: "region", "aria-label": "图片预览" } });
    this.image = this.stage.createEl("img", { cls: "pp-preview-image", attr: { alt: "" } });
    this.image.hidden = true;
    this.coverFeedback = this.stage.createDiv({ cls: "pp-cover-feedback" });

    const navigation = this.navigation = viewer.createDiv({ cls: "pp-navigation", attr: { role: "group", "aria-label": "分页导航" } });
    const steps = navigation.createDiv({ cls: "pp-page-steps" });
    this.previous = steps.createEl("button", { text: "‹", attr: { type: "button", "aria-label": "上一页" } });
    this.count = steps.createSpan({ cls: "pp-page-count" });
    this.next = steps.createEl("button", { text: "›", attr: { type: "button", "aria-label": "下一页" } });
    this.thumbnails = navigation.createDiv({ cls: "pp-thumbnails", attr: { role: "group", "aria-label": "页面缩略图" } });
    this.previous.onclick = () => this.step(-1);
    this.next.onclick = () => this.step(1);
    const keyboard = (event: KeyboardEvent) => {
      if (this.longMode || this.renderedLong || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      this.step(event.key === "ArrowLeft" ? -1 : 1);
      if (this.thumbnails.contains(event.target as Node)) this.currentButton()?.focus({ preventScroll: true });
    };
    this.stage.onkeydown = this.thumbnails.onkeydown = keyboard;

    const settings = workspace.createEl("aside", {
      cls: "pp-settings", attr: { id: settingsId, "aria-label": "导出设置" },
    });
    const header = settings.createDiv({ cls: "pp-settings-header" });
    const tabs = header.createDiv({ cls: "pp-settings-tabs", attr: { role: "tablist", "aria-label": "格式设置" } });
    const templateTab = tabs.createEl("button", { text: "正文模板", attr: { type: "button", role: "tab" } });
    const coverTab = this.coverTab = tabs.createEl("button", { text: "封面设置", attr: { type: "button", role: "tab" } });
    const close = header.createEl("button", { cls: "pp-settings-close", text: "关闭", attr: { type: "button", "aria-label": "关闭设置" } });
    const panels = settings.createDiv({ cls: "pp-settings-panels" });
    this.templates = panels.createDiv();
    this.coverSettings = panels.createDiv();
    const sections = {
      template: { tab: templateTab, content: this.templates },
      cover: { tab: coverTab, content: this.coverSettings },
    };
    const show = (name: SettingsPanel, jumpToCover = false) => {
      for (const [key, { tab, content }] of Object.entries(sections)) {
        const active = name === key;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        content.hidden = !active;
      }
      panels.scrollTop = 0;
      if (jumpToCover && this.coverEnabled) this.selectCover();
    };
    for (const name of ["template", "cover"] as const) {
      const { tab, content } = sections[name];
      tab.id = settingsId + "-" + name + "-tab";
      content.id = settingsId + "-" + name;
      tab.setAttribute("aria-controls", content.id);
      content.setAttribute("role", "tabpanel");
      content.setAttribute("aria-labelledby", tab.id);
      tab.onclick = () => show(name, name === "cover");
      tab.onkeydown = event => {
        if ((event.key !== "ArrowLeft" && event.key !== "ArrowRight") || coverTab.hidden) return;
        event.preventDefault();
        const other = name === "template" ? coverTab : templateTab;
        other.click();
        other.focus();
      };
    }
    this.showTemplateSettings = () => show("template");
    this.showTemplateSettings();
    const setDrawer = (open: boolean) => {
      settings.classList.toggle("is-open", open);
      opener.setAttribute("aria-expanded", String(open));
      if (open) tabs.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
      else opener.focus();
    };
    opener.onclick = () => setDrawer(!settings.classList.contains("is-open"));
    close.onclick = () => setDrawer(false);
    settings.onkeydown = event => {
      if (event.key === "Escape" && close.getClientRects().length) {
        event.stopPropagation();
        setDrawer(false);
      }
    };
    this.refreshImage();
  }

  setMode(long: boolean) {
    this.longMode = long;
    this.coverTab.hidden = long;
    if (long) this.showTemplateSettings();
    this.refreshImage();
  }

  setImages(urls: string[], long: boolean) {
    this.urls = urls;
    this.renderedLong = long;
    if (!long && urls.length) this.page = Math.min(this.page, urls.length - 1);
    this.buildThumbnails();
    this.refreshImage(true);
  }

  setCover(enabled: boolean, url?: string, feedback?: string) {
    const toggled = enabled !== this.coverEnabled;
    this.coverEnabled = enabled;
    this.coverURL = url;
    this.coverMessage = feedback;
    if (toggled) {
      if (enabled) this.viewingCover = true;
      else if (this.viewingCover) {
        this.viewingCover = false;
        this.page = 0;
      }
      this.buildThumbnails();
    } else if (this.coverButton) {
      this.setSource(this.coverButton.querySelector("img")!, url);
    }
    this.refreshImage(toggled);
  }

  private buildThumbnails() {
    this.thumbnails.replaceChildren();
    this.coverButton = undefined;
    this.pageButtons = [];
    if (this.renderedLong || !this.urls.length) return;
    if (this.coverEnabled) {
      this.coverButton = this.thumbnail("封面", this.coverURL, () => this.selectCover());
    }
    this.pageButtons = this.urls.map((url, i) => this.thumbnail("第 " + (i + 1) + " 页", url, () => this.selectPage(i)));
  }

  private thumbnail(label: string, url: string | undefined, select: () => void) {
    const thumb = this.thumbnails.createEl("button", {
      cls: "pp-thumbnail", attr: { type: "button", "aria-label": label },
    });
    const preview = thumb.createSpan({ cls: "pp-thumbnail-image" });
    this.setSource(preview.createEl("img", { attr: { alt: "", loading: "lazy", decoding: "async" } }), url);
    thumb.createSpan({ cls: "pp-thumbnail-label", text: label });
    thumb.onclick = select;
    return thumb;
  }

  private setSource(image: HTMLImageElement, url?: string) {
    if (url && image.getAttribute("src") !== url) image.src = url;
    if (!url) image.removeAttribute("src");
    image.hidden = !url;
  }

  private currentButton() { return this.viewingCover ? this.coverButton : this.pageButtons[this.page]; }

  private refreshNavigation() {
    this.navigation.hidden = this.longMode || this.renderedLong || !this.urls.length;
    const current = this.currentButton();
    for (const button of this.thumbnails.querySelectorAll("button")) {
      button.setAttribute("aria-current", String(button === current));
      button.tabIndex = button === current ? 0 : -1;
    }
    this.previous.disabled = this.viewingCover || (!this.coverEnabled && this.page === 0);
    this.next.disabled = !this.viewingCover && this.page >= this.urls.length - 1;
    this.count.setText(this.viewingCover ? "封面" : (this.page + 1) + " / " + this.urls.length);
    if (!this.navigation.hidden && current) {
      const strip = this.thumbnails.getBoundingClientRect();
      const bounds = current.getBoundingClientRect();
      if (bounds.left < strip.left) this.thumbnails.scrollLeft += bounds.left - strip.left;
      else if (bounds.right > strip.right) this.thumbnails.scrollLeft += bounds.right - strip.right;
    }
  }

  private refreshImage(reset = false) {
    const isCover = !this.renderedLong && this.viewingCover;
    const url = isCover ? (this.urls.length ? this.coverURL : undefined) : this.urls[this.renderedLong ? 0 : this.page];
    this.image.alt = this.renderedLong ? "文章长图" : isCover ? "封面" : "第 " + (this.page + 1) + " 页";
    this.setSource(this.image, url);
    this.coverFeedback.hidden = !isCover || !!url || !this.coverMessage;
    this.coverFeedback.setText(this.coverMessage ?? "");
    this.stage.classList.toggle("pp-fit-width", this.renderedLong || this.fitWidth);
    this.zoom.setText(this.fitWidth ? "适合窗口" : "适合宽度");
    this.zoom.hidden = this.longMode || this.renderedLong;
    this.zoom.disabled = !url;
    if (reset) this.stage.scrollTop = 0;
    this.refreshNavigation();
  }

  private selectCover() {
    this.viewingCover = true;
    this.refreshImage(true);
  }

  private selectPage(page: number) {
    this.viewingCover = false;
    this.page = page;
    this.refreshImage(true);
  }

  private step(direction: number) {
    if (this.navigation.hidden || (direction < 0 ? this.previous.disabled : this.next.disabled)) return;
    if (this.viewingCover) this.selectPage(0);
    else if (this.page === 0 && direction < 0) this.selectCover();
    else this.selectPage(this.page + direction);
  }
}
