import { sanitizeHTMLToDom } from "obsidian";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: false });
md.inline.ruler.before("image", "vault-image", (state, silent) => {
  const match = /^!\[\[([^\]\n]+)\]\]/.exec(state.src.slice(state.pos));
  if (!match) return false;
  if (!silent) {
    const [src, label = ""] = match[1].split("|");
    const token = state.push("image", "img", 0);
    token.attrSet("src", src.trim());
    if (/^[1-9]\d*$/.test(label.trim()) && Number.isSafeInteger(Number(label))) {
      token.attrSet("data-width", label.trim());
    }
    token.content = label;
  }
  state.pos += match[0].length;
  return true;
});
// Keep attachments inert until the user opens the preview.
md.renderer.rules.image = (tokens, i) => {
  const source = md.utils.escapeHtml(String(tokens[i].attrGet("src") ?? ""));
  const width = tokens[i].attrGet("data-width");
  return '<img data-source="' + source + '"' + (width ? ' data-width="' + width + '"' : '') + ' />';
};

md.inline.ruler.before("link", "vault-link", (state, silent) => {
  if (!state.env?.publicText || !state.src.startsWith("[[", state.pos)) return false;
  const match = /^\[\[([^\]\n]+)\]\]/.exec(state.src.slice(state.pos));
  if (!match) return false;
  const [target, alias] = match[1].split("|");
  const [path, heading] = target.split("#");
  if (!silent) state.pending += alias?.trim() || path.split("/").pop()?.replace(/\.md$/i, "") || heading || "";
  state.pos += match[0].length;
  return true;
});

function renderArticle(doc: Document, markdown: string, title: string, publicText = false) {
  const root = doc.adoptNode(sanitizeHTMLToDom(md.render(markdown, { publicText })));
  if (root.firstElementChild?.tagName !== "H1") {
    const heading = doc.createElement("h1");
    heading.textContent = title;
    root.prepend(heading);
  }
  return root;
}

export function article(doc: Document, markdown: string, fallback: string) {
  const root = renderArticle(doc, markdown, fallback);
  const articleHeading = root.firstElementChild;
  const title = articleHeading?.textContent?.trim() || fallback;
  const bodyText = Array.from(root.children).slice(1).map(child => child.textContent).join("");
  const wordCount = bodyText.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
  const blocks: HTMLElement[] = [];
  let markedTitle = false;
  function visit(el: Element, depth: number, quoted: boolean) {
    if (el.matches("ul,ol")) {
      let number = Number(el.getAttribute("start") || 1);
      for (const item of Array.from(el.children)) {
        const start = blocks.length;
        let inline = doc.createElement("p");
        const flush = () => {
          if (inline.textContent?.trim() || inline.querySelector("img")) visit(inline, depth + 1, quoted);
          inline = doc.createElement("p");
        };
        for (const child of Array.from(item.childNodes)) {
          if (child.nodeType === 1 && (child as Element).matches("ul,ol,p,blockquote,pre,h1,h2,h3,h4,h5,h6")) {
            flush(); visit(child as Element, depth + 1, quoted);
          } else inline.append(child.cloneNode(true));
        }
        flush();
        const first = blocks[start];
        if (first) first.dataset.marker = el.tagName === "OL" ? number++ + "." : "•";
      }
      return;
    }
    if (el.tagName === "BLOCKQUOTE") {
      for (const child of el.children) visit(child, depth, true);
      return;
    }
    const emit = (block: HTMLElement) => {
      if (depth) block.style.marginLeft = Math.min(depth, 8) * 52 + "px";
      if (quoted) block.classList.add("quoted");
      if (!depth && !quoted && block.tagName === "P") block.dataset.prose = "";
      blocks.push(block);
    };
    const range = doc.createRange();
    range.selectNodeContents(el);
    const emitText = () => {
      const block = el.cloneNode(false) as HTMLElement;
      block.append(range.cloneContents());
      if (block.textContent?.trim() || block.querySelector("br") || el.tagName === "HR") {
        if (el === articleHeading && !markedTitle) {
          block.dataset.articleTitle = "";
          markedTitle = true;
        }
        emit(block);
      }
    };
    for (const img of el.querySelectorAll("img")) {
      range.setEndBefore(img);
      emitText();
      const figure = doc.createElement("figure");
      figure.append(img.cloneNode(true));
      emit(figure);
      range.setStartAfter(img);
      range.setEnd(el, el.childNodes.length);
    }
    emitText();
  }
  for (const child of root.children) visit(child, 0, false);
  return { title, blocks, wordCount };
}

export function textArticle(doc: Document, markdown: string, fallback: string) {
  const root = renderArticle(doc, markdown, fallback, true);
  const heading = root.firstElementChild!;
  const title = heading.textContent?.trim() || fallback;
  heading.remove();
  for (const link of root.querySelectorAll("a")) {
    if (!/^(https?:\/\/|mailto:)/i.test(link.getAttribute("href") || "")) link.replaceWith(...link.childNodes);
  }
  const body = doc.createElement("div");
  body.append(root);
  return { title, body };
}
