const pageCSS = `
*{box-sizing:border-box}
body{margin:0}
.page{display:flow-root;width:1080px;height:1440px;padding:78px 80px;background:white;color:#242425;font:36px/1.58 "PingFang SC","Microsoft YaHei","Noto Sans CJK SC",Arial,sans-serif;overflow-wrap:anywhere;line-break:strict}
.page>*{position:relative;margin:0}
.page>*+*{margin-top:25px}
h1,h2,h3,h4,h5,h6{line-height:1.3;font-weight:700}
h1{font-size:62px}h2{font-size:49px}h3{font-size:43px}h4{font-size:39px}h5{font-size:37px}h6{font-size:36px}
a{color:#244e65;text-decoration:underline}
.quoted{border-left:5px solid #aeb5bb;padding-left:25px;color:#49515a}
[data-marker]::before{content:attr(data-marker);position:absolute;right:calc(100% + 8px);top:0}
pre,code{font-family:ui-monospace,monospace;font-size:.9em;background:#f2f3f4;white-space:pre-wrap}
figure img{display:block;max-width:100%;max-height:1284px;height:auto;margin:auto}
hr{height:2px;border:0;background:#d0d0d0}
table{border-collapse:collapse;width:100%;font-size:30px}td,th{border:1px solid #bbb;padding:6px}
`;
const heading = (el: Element) => /^H[1-6]$/.test(el.tagName);

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

export function paginate(doc: Document, blocks: HTMLElement[]): HTMLElement[] {
  const style = doc.createElement("style");
  style.textContent = pageCSS;
  doc.head.append(style);
  const pages: HTMLElement[] = [];
  function nextPage() {
    const page = doc.createElement("article");
    page.className = "page";
    doc.body.append(page);
    pages.push(page);
    return page;
  }
  let page = nextPage();
  const floor = () => page.getBoundingClientRect().bottom - 78;
  for (let index = 0; index < blocks.length; index++) {
    let block = blocks[index];
    while (true) {
      page.append(block);
      const hasEarlier = !!block.previousElementSibling;
      if (heading(block) && hasEarlier && blocks[index + 1]) {
        const next = blocks[index + 1];
        page.append(next);
        const bounds = next.getBoundingClientRect();
        const fitsOpening = bounds.top + (next.tagName === "FIGURE" ? bounds.height : Math.min(bounds.height, parseFloat(doc.defaultView!.getComputedStyle(next).lineHeight))) <= floor();
        next.remove();
        if (!fitsOpening) { block.remove(); page = nextPage(); continue; }
      }
      if (block.getBoundingClientRect().bottom <= floor() + 0.01) break;
      if (block.matches("figure,table") || (heading(block) && hasEarlier)) {
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

export async function renderPNG(page: HTMLElement): Promise<Blob> {
  const doc = page.ownerDocument;
  const wrap = doc.createElement("div");
  const style = doc.createElement("style");
  style.textContent = pageCSS;
  wrap.append(style, page.cloneNode(true));
  const xml = new XMLSerializer().serializeToString(wrap);
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440"><foreignObject width="1080" height="1440">' + xml + '</foreignObject></svg>';
  const image = new Image();
  image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  await image.decode();
  const canvas = doc.createElement("canvas");
  canvas.width = 1080; canvas.height = 1440;
  canvas.getContext("2d")!.drawImage(image, 0, 0);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG 生成失败")), "image/png"));
}
