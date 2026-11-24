import { pageHeight, pageWidth, renderPNG } from "./layout";

interface CoverPalette {
  label: string;
  paper: string;
  ink: string;
  accent: string;
  muted: string;
  surface?: string;
}

export const coverTemplates = {
  statement: { label: "大字标题", image: false, titleSize: 144, minTitleSize: 80, palettes: [
    { label: "钴蓝", paper: "#f7f4ea", ink: "#242222", accent: "#243dcc", muted: "#2d3c9e" },
    { label: "柿红", paper: "#fff0e3", ink: "#392a24", accent: "#b54733", muted: "#8c3b2e" },
    { label: "松绿", paper: "#edf1e2", ink: "#25352b", accent: "#285b46", muted: "#305b47" },
  ] },
  screenshot: { label: "截图导读", image: true, titleSize: 100, minTitleSize: 66, palettes: [
    { label: "湖蓝", paper: "#e9f1f6", ink: "#242222", accent: "#12648a", muted: "#355466" },
    { label: "苔绿", paper: "#e9f0e7", ink: "#243a2d", accent: "#38634d", muted: "#345241" },
    { label: "雾紫", paper: "#f0edf7", ink: "#302742", accent: "#63518c", muted: "#514367" },
  ] },
  magazine: { label: "杂志图封", image: true, titleSize: 108, minTitleSize: 68, palettes: [
    { label: "暖纸", paper: "#f2e6d3", ink: "#35251c", accent: "#9a6650", muted: "#654839", surface: "#3b322b" },
    { label: "灰蓝", paper: "#e5edf0", ink: "#233842", accent: "#54778a", muted: "#365566", surface: "#273e49" },
    { label: "茶红", paper: "#f2e3e0", ink: "#452d32", accent: "#955b64", muted: "#6c4149", surface: "#483238" },
  ] },
  photo: { label: "全幅照片", image: true, titleSize: 117, minTitleSize: 67, palettes: [
    { label: "岩灰", paper: "#272829", ink: "#ffffff", accent: "#d6e1eb", muted: "#f0f2f4" },
    { label: "暮蓝", paper: "#151f40", ink: "#ffffff", accent: "#cbd7ff", muted: "#edf1ff" },
    { label: "棕影", paper: "#39251c", ink: "#fff9f0", accent: "#ffd8b0", muted: "#fff1e1" },
  ] },
} satisfies Record<string, {
  label: string; image: boolean; titleSize: number; minTitleSize: number;
  palettes: [CoverPalette, CoverPalette, CoverPalette];
}>;
export type CoverTemplateId = keyof typeof coverTemplates;
export const defaultCoverTemplate: CoverTemplateId = "statement";
export type CoverPaletteIndex = 0 | 1 | 2;
export interface CoverCrop {
  horizontal: "left" | "center" | "right";
  vertical: "top" | "center" | "bottom";
}

const coverCSS = `
*{box-sizing:border-box}
.cover{display:grid;position:relative;width:${pageWidth}px;height:${pageHeight}px;overflow:hidden;
  background:var(--paper);color:var(--ink);font-family:"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",Arial,sans-serif}
.cover-copy{min-width:0;min-height:0;display:flex;flex-direction:column;justify-content:center;
  overflow-wrap:anywhere;line-break:strict;white-space:pre-wrap}
.cover h1,.cover p{margin:0;font-weight:inherit}
.cover h1{line-height:1.12;text-wrap:balance}
.cover p{margin-top:26px;font-size:40px;line-height:1.35;color:var(--muted)}
.cover-meta{display:flex;flex-wrap:wrap;gap:8px 24px;margin-top:22px;color:var(--muted);font-size:31px;line-height:1.3}
.cover-meta span{min-width:0}
.cover-image{display:block;width:100%;height:100%;min-height:0;object-fit:contain}
.cover[data-cover="statement"]{grid-template-rows:minmax(0,1fr);padding:88px 96px 380px}
.cover[data-cover="statement"]::after{content:"";position:absolute;inset:auto 0 0;height:310px;background:var(--accent)}
.cover[data-cover="statement"] h1{font-weight:800;letter-spacing:-.035em}
.cover[data-cover="screenshot"]{grid-template-rows:365px minmax(0,1fr);gap:36px;padding:70px 76px 76px}
.cover[data-cover="screenshot"] .cover-copy{border-top:8px solid var(--accent);padding-top:16px}
.cover[data-cover="screenshot"] h1{font-weight:750;letter-spacing:-.025em}
.cover[data-cover="screenshot"] .cover-image{padding:24px;background:#fff;border:2px solid #c9dce7;border-radius:22px}
.cover[data-cover="magazine"]{grid-template-rows:912px minmax(0,1fr)}
.cover[data-cover="magazine"] .cover-image{grid-row:1;background:var(--surface)}
.cover[data-cover="magazine"] .cover-copy{grid-row:2;margin:38px 86px 48px;border-top:2px solid var(--accent);padding-top:18px}
.cover[data-cover="magazine"] h1{font-family:"Songti SC","Noto Serif CJK SC",SimSun,serif;font-weight:700}
.cover[data-cover="photo"]{grid-template-rows:minmax(0,1fr) 518px}
.cover[data-cover="photo"] .cover-image{position:absolute;inset:0;object-fit:cover}
.cover[data-cover="photo"]::after{content:"";position:absolute;inset:0;
  background:linear-gradient(180deg,transparent 36%,color-mix(in srgb,var(--paper) 85%,transparent) 64%,var(--paper) 100%)}
.cover[data-cover="photo"] .cover-copy{position:relative;z-index:1;grid-row:2;margin:0 88px 70px;justify-content:end}
.cover[data-cover="photo"] h1{font-weight:750;letter-spacing:-.025em}
.cover[data-cover="photo"] .cover-meta{color:var(--accent)}
`;

export interface CoverContent {
  template: CoverTemplateId;
  title: string;
  subtitle: string;
  image?: string;
  author?: string;
  wordCount?: number;
  palette?: CoverPaletteIndex;
  crop?: CoverCrop;
}

const authorCharacters = new Intl.Segmenter(undefined, { granularity: "grapheme" });
export const coverAuthorLimit = 20;

export async function renderCover(doc: Document, {
  template, title, subtitle, image, author = "", wordCount, palette = 0, crop,
}: CoverContent): Promise<Blob> {
  const design = coverTemplates[template];
  if (!title.trim()) throw new Error("请输入封面标题。");
  if (design.image && !image) throw new Error("请选择一张封面配图。");
  const byline = author.trim();
  if (Array.from(authorCharacters.segment(byline)).length > coverAuthorLimit) {
    throw new Error(`作者最多输入 ${coverAuthorLimit} 个字符。`);
  }

  if (!doc.head.querySelector("style[data-pp-cover]")) {
    const style = doc.createElement("style");
    style.dataset.ppCover = "";
    style.textContent = coverCSS;
    doc.head.append(style);
  }
  const page = doc.createElement("article");
  page.className = "cover";
  page.dataset.cover = template;
  const colors: CoverPalette = design.palettes[palette];
  const { paper, ink, accent, muted, surface } = colors;
  page.style.setProperty("--paper", paper);
  page.style.setProperty("--ink", ink);
  page.style.setProperty("--accent", accent);
  page.style.setProperty("--muted", muted);
  if (surface) page.style.setProperty("--surface", surface);
  const copy = doc.createElement("div");
  copy.className = "cover-copy";
  const heading = doc.createElement("h1");
  heading.textContent = title.trim();
  copy.append(heading);
  const subheading = doc.createElement("p");
  if (subtitle.trim()) {
    subheading.textContent = subtitle.trim();
    copy.append(subheading);
  }
  if (byline || wordCount !== undefined) {
    const meta = doc.createElement("div");
    meta.className = "cover-meta";
    if (byline) {
      const name = doc.createElement("span");
      name.textContent = byline;
      meta.append(name);
    }
    if (wordCount !== undefined) {
      const reading = doc.createElement("span");
      reading.textContent = `${wordCount} 字 · 预计 ${Math.ceil(wordCount / 400)} 分钟`;
      meta.append(reading);
    }
    copy.append(meta);
  }
  page.append(copy);
  const photo = doc.createElement("img");
  if (design.image && image) {
    photo.className = "cover-image";
    if (template === "photo" && crop) photo.style.objectPosition = `${crop.horizontal} ${crop.vertical}`;
    photo.src = image;
    page.append(photo);
    await photo.decode();
  }

  heading.style.fontSize = design.titleSize + "px";
  doc.body.append(page);
  try {
    await doc.fonts.ready;
    const top = copy.getBoundingClientRect().top + copy.clientTop
      + parseFloat(doc.defaultView!.getComputedStyle(copy).paddingTop);
    const bottom = copy.getBoundingClientRect().bottom;
    const subtitleBounds = subheading.getBoundingClientRect();
    if (subtitleBounds.height > 109) throw new Error("副标题太长，请缩短到两行以内。");
    for (let size = design.titleSize; size >= design.minTitleSize; size -= 2) {
      heading.style.fontSize = size + "px";
      const bounds = heading.getBoundingClientRect();
      const textBottom = copy.lastElementChild!.getBoundingClientRect().bottom;
      if (bounds.height <= size * 1.12 * 3 + 1 && bounds.top >= top - 1 && textBottom <= bottom + 1) {
        return await renderPNG(page, coverCSS);
      }
    }
    throw new Error("标题太长，请缩短到三行以内。");
  } finally {
    page.remove();
  }
}
