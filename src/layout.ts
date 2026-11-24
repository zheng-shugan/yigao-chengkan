export const pageWidth = 1080;
export const pageHeight = 1440;

export const pageTemplates = {
  classic: {
    label: "经典白底", paper: "#ffffff", ink: "#242425", accent: "#aeb5bb",
    top: 78, bottom: 78, side: 80, fontSize: 36, lineHeight: 1.58, gap: 25,
  },
  warm: {
    label: "暖纸便签", paper: "#fffcf7", ink: "#665749", accent: "#e8e4db",
    top: 128, bottom: 92, side: 104, fontSize: 42, lineHeight: 1.74, gap: 28,
  },
  column: {
    label: "色块专栏", paper: "#f5f5fa", ink: "#272740", accent: "#292451",
    top: 82, bottom: 82, side: 80, fontSize: 37, lineHeight: 1.58, gap: 29,
  },
  grid: {
    label: "方格手记", paper: "#faf6e9", ink: "#272e25", accent: "#28523e",
    top: 91, bottom: 90, side: 88, fontSize: 36, lineHeight: 1.68, gap: 26,
  },
  outline: {
    label: "章节提纲", paper: "#f4f8fb", ink: "#263849", accent: "#2c617f",
    top: 82, bottom: 82, side: 84, fontSize: 35, lineHeight: 1.52, gap: 22,
  },
};
export type TemplateId = keyof typeof pageTemplates;
export const defaultTemplate: TemplateId = "classic";

const fontFamily = '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",Arial,sans-serif';
export function pictureBounds(id: TemplateId) {
  const { top, bottom, side } = pageTemplates[id];
  return { width: pageWidth - 2 * side, height: pageHeight - top - bottom };
}

const templateCSS = Object.entries(pageTemplates).map(([key, template]) => {
  const page = `.page[data-template="${key}"]`;
  const { top, bottom, side, paper, ink, accent, fontSize, lineHeight, gap } = template;
  return `
${page}{padding:${top}px ${side}px ${bottom}px;background:${paper};color:${ink};font:${fontSize}px/${lineHeight} ${fontFamily}}
${page}>*+*{margin-top:${gap}px}
${page} .quoted{border-left-color:${accent}}
${page} figure img{max-height:${pageHeight - top - bottom}px}
`;
}).join("");

const pageCSS = `
*{box-sizing:border-box}
body{margin:0}
.page{display:flow-root;width:${pageWidth}px;height:${pageHeight}px;overflow-wrap:anywhere;line-break:strict}
.page>*{position:relative;margin:0}
h1,h2,h3,h4,h5,h6{line-height:1.3;font-weight:700}
h1{font-size:62px}h2{font-size:49px}h3{font-size:43px}h4{font-size:39px}h5{font-size:37px}h6{font-size:36px}
a{color:#244e65;text-decoration:underline}
.quoted{border-left:5px solid;padding-left:25px;color:#49515a}
[data-marker]::before{content:attr(data-marker);position:absolute;right:calc(100% + 8px);top:0}
pre,code{font-family:ui-monospace,monospace;font-size:.9em;background:#f2f3f4;white-space:pre-wrap}
figure img{display:block;max-width:100%;height:auto;margin:auto}
hr{height:2px;border:0;background:#d0d0d0}
table{border-collapse:collapse;width:100%;font-size:30px}td,th{border:1px solid #bbb;padding:6px}
${templateCSS}
.page[data-template="warm"]{position:relative}
.page[data-template="warm"]::before{content:"";position:absolute;inset:48px 34px;border:5px double ${pageTemplates.warm.accent};pointer-events:none}
.page[data-template="warm"]>h1{font-size:52px;color:#625241}
.page[data-template="warm"]>[data-article-title]+[data-prose]{margin-top:96px}
.page[data-template="warm"]>[data-prose]+[data-prose]{margin-top:82px}
.page[data-template="warm"] a{color:#71533d}
.page[data-template="warm"] .quoted{color:inherit;border-left-color:#cbbbab}
.page[data-template="warm"] pre,.page[data-template="warm"] code{background:#f4eee4}
.page[data-template="warm"] hr{background:#e8e4db}
.page[data-template="warm"] td,.page[data-template="warm"] th{border-color:#d8cdbf}
.page[data-template="column"][data-first]>[data-article-title]{
  background:#292451;color:#faf8ff;padding:72px 52px;font-size:78px;line-height:1.16;text-wrap:balance}
.page[data-template="column"]>h2{color:#292451;border-bottom:2px solid #c1bdd4;padding-bottom:12px}
.page[data-template="column"]>h3{color:#454070}
.page[data-template="grid"]{
  background-image:linear-gradient(#bdad882b 1px,transparent 1px),linear-gradient(90deg,#bdad882b 1px,transparent 1px);
  background-size:38px 38px;background-position:center top}
.page[data-template="grid"]>h1{color:#234634;font-family:"Songti SC","Noto Serif CJK SC",SimSun,serif}
.page[data-template="grid"]>h2{color:#234634;background:#e0e9d4;padding:9px 17px}
.page[data-template="grid"]>h3{color:#28523e}
.page[data-template="outline"]>h1{color:#294c64;font-size:66px}
.page[data-template="outline"]>h2{border-left:7px solid #2c617f;padding-left:18px;color:#234c67}
.page[data-template="outline"]>h3{font-size:39px;color:#385e77}
.page[data-template="outline"] .quoted{background:#e7f0f6;color:#36536a}
.page[data-template="outline"] [data-marker]::before{color:#2c617f;font-weight:650}
`;

export function sizePicture(img: HTMLImageElement, id: TemplateId) {
  const { width, height } = pictureBounds(id);
  const preferred = Number(img.dataset.width) || img.naturalWidth;
  img.style.width = Math.min(preferred, width, height * img.naturalWidth / img.naturalHeight) + "px";
  img.height = img.naturalHeight;
}
const heading = (el: Element) => /^H[1-6]$/.test(el.tagName);

const minImageScale = 0.85;

function shortParagraph(block: Element | null | undefined, lines: number) {
  if (block?.tagName !== "P") return false;
  const lineHeight = parseFloat(block.ownerDocument.defaultView!.getComputedStyle(block).lineHeight);
  return block.getBoundingClientRect().height <= lines * lineHeight + 0.1;
}

// Measure at the preferred width. A failed trial must leave the next page at that width.
function fitFigure(figure: HTMLElement, floor: number) {
  if (figure.getBoundingClientRect().bottom <= floor + 0.01) return true;
  const img = figure.querySelector("img")!;
  const bounds = img.getBoundingClientRect();
  const scale = (floor - bounds.top) / bounds.height;
  if (img.dataset.width || scale < minImageScale) return false;
  const preferred = img.style.width;
  img.style.width = bounds.width * scale + "px";
  if (figure.getBoundingClientRect().bottom <= floor + 0.02) return true;
  img.style.width = preferred;
  return false;
}

// Find the last complete rendered line that fits, retaining nested inline markup.
function split(block: HTMLElement, floor: number): HTMLElement | null {
  const doc = block.ownerDocument;
  const walker = doc.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const range = doc.createRange();
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  let last: { node: Text; offset: number } | undefined;
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const ends = Array.from(segmenter.segment(node.data), s => s.index + s.segment.length);
    let low = 0, high = ends.length;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      range.setStart(node, mid === 1 ? 0 : ends[mid - 2]);
      range.setEnd(node, ends[mid - 1]);
      if (range.getBoundingClientRect().bottom <= floor) low = mid;
      else high = mid - 1;
    }
    if (low) last = { node, offset: ends[low - 1] };
    if (low < ends.length) break;
  }
  if (!last) return null;
  range.selectNodeContents(block);
  range.setStart(last.node, last.offset);
  const tail = block.cloneNode(false) as HTMLElement;
  tail.removeAttribute("data-marker");
  tail.append(range.extractContents());
  return tail;
}

export function paginate(doc: Document, blocks: HTMLElement[], id = defaultTemplate): HTMLElement[] {
  if (!doc.head.querySelector("style[data-pp-layout]")) {
    const style = doc.createElement("style");
    style.dataset.ppLayout = "";
    style.textContent = pageCSS;
    doc.head.append(style);
  }
  const pages: HTMLElement[] = [];
  function nextPage() {
    const page = doc.createElement("article");
    page.className = "page";
    page.dataset.template = id;
    if (!pages.length) page.dataset.first = "";
    doc.body.append(page);
    pages.push(page);
    return page;
  }
  let page = nextPage();
  const floor = () => page.getBoundingClientRect().bottom - pageTemplates[id].bottom;
  for (let index = 0; index < blocks.length; index++) {
    let block = blocks[index];
    if (block.tagName === "FIGURE") {
      page.append(block);
      if (!fitFigure(block, floor())) {
        const prev = block.previousElementSibling;
        const previousHeading = prev?.previousElementSibling;
        const title = previousHeading && heading(previousHeading) ? previousHeading : null;
        const carry = prev && prev === blocks[index - 1] && shortParagraph(prev, 3) &&
          (title ?? prev).previousElementSibling;
        const oldPage = page;
        page = nextPage();
        if (carry) {
          if (title) page.append(title);
          page.append(prev);
        }
        page.append(block);
        if (carry && !fitFigure(block, floor())) {
          if (title) oldPage.append(title);
          oldPage.append(prev);
        }
      }
      const next = blocks[index + 1];
      if (!block.previousElementSibling && next?.tagName === "P") {
        page.append(next);
        if (shortParagraph(next, 5)) {
          const reserve = next.getBoundingClientRect().bottom - block.getBoundingClientRect().bottom;
          fitFigure(block, floor() - reserve);
        }
        next.remove();
      }
      continue;
    }
    while (true) {
      page.append(block);
      const hasEarlier = !!block.previousElementSibling;
      if (heading(block) && hasEarlier && blocks[index + 1]) {
        const next = blocks[index + 1];
        page.append(next);
        const bounds = next.getBoundingClientRect();
        const fitsOpening = next.tagName === "FIGURE"
          ? fitFigure(next, floor())
          : bounds.top + Math.min(bounds.height, parseFloat(doc.defaultView!.getComputedStyle(next).lineHeight)) <= floor();
        next.remove();
        if (!fitsOpening) { block.remove(); page = nextPage(); continue; }
      }
      if (block.getBoundingClientRect().bottom <= floor() + 0.01) break;
      if (block.matches("table") || (heading(block) && hasEarlier)) {
        if (!hasEarlier) throw new Error("此内容超过单页高度，请拆分表格或调整配图后重试。");
        block.remove(); page = nextPage(); continue;
      }
      const full = block;
      const lineHeight = parseFloat(doc.defaultView!.getComputedStyle(full).lineHeight);
      let remainder: HTMLElement | null = null;
      // The glyph bounds can fit while the line box still crosses the margin.
      for (const limit of [floor(), floor() - lineHeight / 2]) {
        const prefix = full.cloneNode(true) as HTMLElement;
        full.replaceWith(prefix);
        const tail = split(prefix, limit);
        if (tail?.hasChildNodes() && prefix.hasChildNodes() &&
            prefix.getBoundingClientRect().bottom <= floor() + 0.01) {
          remainder = tail;
          break;
        }
        prefix.replaceWith(full);
      }
      if (remainder) block = remainder;
      else {
        if (!hasEarlier) throw new Error("无法完整排入此段内容，请检查格式后重试。");
        full.remove();
      }
      page = nextPage();
    }
  }
  return pages;
}

export const exportScale = 2;

export async function renderPNG(page: HTMLElement, css = pageCSS): Promise<Blob> {
  const doc = page.ownerDocument;
  const wrap = doc.createElement("div");
  const style = doc.createElement("style");
  style.textContent = css;
  wrap.append(style, page.cloneNode(true));
  const xml = new XMLSerializer().serializeToString(wrap);
  const width = pageWidth * exportScale;
  const height = pageHeight * exportScale;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${pageWidth} ${pageHeight}"><foreignObject width="${pageWidth}" height="${pageHeight}">${xml}</foreignObject></svg>`;
  const image = doc.createElement("img");
  image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  await image.decode();
  const canvas = doc.createElement("canvas");
  canvas.width = width; canvas.height = height;
  canvas.getContext("2d")!.drawImage(image, 0, 0);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG 生成失败")), "image/png"));
}
