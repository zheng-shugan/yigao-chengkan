import { pageHeight, pageWidth, renderPNG } from "./layout";

export const coverTemplates = {
  statement: { label: "大字标题", image: false, titleSize: 144, minTitleSize: 80 },
  screenshot: { label: "截图导读", image: true, titleSize: 100, minTitleSize: 66 },
  magazine: { label: "杂志图封", image: true, titleSize: 108, minTitleSize: 68 },
};
export type CoverTemplateId = keyof typeof coverTemplates;
export const defaultCoverTemplate: CoverTemplateId = "statement";

const coverCSS = `
*{box-sizing:border-box}
.cover{display:grid;position:relative;width:${pageWidth}px;height:${pageHeight}px;overflow:hidden;
  color:#242222;font-family:"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",Arial,sans-serif}
.cover-copy{min-width:0;min-height:0;display:flex;flex-direction:column;justify-content:center;
  overflow-wrap:anywhere;line-break:strict;white-space:pre-wrap}
.cover h1,.cover p{margin:0;font-weight:inherit}
.cover h1{line-height:1.12;text-wrap:balance}
.cover p{margin-top:26px;font-size:40px;line-height:1.35}
.cover-image{display:block;width:100%;height:100%;min-height:0;object-fit:contain}
.cover[data-cover="statement"]{grid-template-rows:minmax(0,1fr);padding:88px 96px 380px;background:#f7f4ea}
.cover[data-cover="statement"]::after{content:"";position:absolute;inset:auto 0 0;height:310px;background:#243dcc}
.cover[data-cover="statement"] h1{font-weight:800;letter-spacing:-.035em}
.cover[data-cover="statement"] p{color:#2d3c9e}
.cover[data-cover="screenshot"]{grid-template-rows:365px minmax(0,1fr);gap:36px;padding:70px 76px 76px;background:#e9f1f6}
.cover[data-cover="screenshot"] .cover-copy{border-top:8px solid #12648a;padding-top:16px}
.cover[data-cover="screenshot"] h1{font-weight:750;letter-spacing:-.025em}
.cover[data-cover="screenshot"] p{color:#355466}
.cover[data-cover="screenshot"] .cover-image{padding:24px;background:#fff;border:2px solid #c9dce7;border-radius:22px}
.cover[data-cover="magazine"]{grid-template-rows:912px minmax(0,1fr);background:#f2e6d3;color:#35251c}
.cover[data-cover="magazine"] .cover-image{grid-row:1;background:#3b322b}
.cover[data-cover="magazine"] .cover-copy{grid-row:2;margin:38px 86px 48px;border-top:2px solid #9a6650;padding-top:18px}
.cover[data-cover="magazine"] h1{font-family:"Songti SC","Noto Serif CJK SC",SimSun,serif;font-weight:700}
.cover[data-cover="magazine"] p{color:#654839}
`;

export interface CoverContent {
  template: CoverTemplateId;
  title: string;
  subtitle: string;
  image?: string;
}

export async function renderCover(doc: Document, { template, title, subtitle, image }: CoverContent): Promise<Blob> {
  const design = coverTemplates[template];
  if (!title.trim()) throw new Error("请输入封面标题。");
  if (design.image && !image) throw new Error("请选择一张封面配图。");

  if (!doc.head.querySelector("style[data-pp-cover]")) {
    const style = doc.createElement("style");
    style.dataset.ppCover = "";
    style.textContent = coverCSS;
    doc.head.append(style);
  }
  const page = doc.createElement("article");
  page.className = "cover";
  page.dataset.cover = template;
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
  page.append(copy);
  const photo = doc.createElement("img");
  if (design.image && image) {
    photo.className = "cover-image";
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
      const textBottom = subheading.parentElement ? subheading.getBoundingClientRect().bottom : bounds.bottom;
      if (bounds.height <= size * 1.12 * 3 + 1 && bounds.top >= top - 1 && textBottom <= bottom + 1) {
        return await renderPNG(page, coverCSS);
      }
    }
    throw new Error("标题太长，请缩短到三行以内。");
  } finally {
    page.remove();
  }
}
