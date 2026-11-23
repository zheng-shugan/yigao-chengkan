import { Document as WordDocument, ExternalHyperlink, HeadingLevel, ImageRun, LevelFormat,
  Packer, Paragraph, Table, TableCell, TableRow, TextRun } from "docx";
import type { ILevelsOptions, IParagraphOptions, IRunOptions, ParagraphChild } from "docx";

export async function preparePicture(blob: Blob) {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode().catch(() => { throw new Error("图片损坏或格式无法解码"); });
    const width = img.naturalWidth, height = img.naturalHeight;
    let data = new Uint8Array(await blob.arrayBuffer());
    let type: "png" | "jpg" | "gif";
    if (data[0] === 0xff && data[1] === 0xd8) type = "jpg";
    else if (data[0] === 0x47 && data[1] === 0x49) type = "gif";
    else if (data[0] === 0x89 && data[1] === 0x50) type = "png";
    else {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
        b => b ? resolve(b) : reject(new Error("无法转换为 PNG")), "image/png"));
      data = new Uint8Array(await png.arrayBuffer());
      type = "png";
    }
    return { data, type, width, height, url };
  } catch (e) { URL.revokeObjectURL(url); throw e; }
}

function isElement(node: Node): node is Element {
  return node.nodeType === 1;
}

export type Picture = Awaited<ReturnType<typeof preparePicture>>;

export async function wordArticle(body: HTMLElement, title: string, pictures: Map<string, Picture>) {
  const numbering: {reference: string; levels: ILevelsOptions[]}[] = [];
  function inline(node: Node, style: IRunOptions = {}): ParagraphChild[] {
    if (node.nodeType === 3) return [new TextRun({...style, text: node.textContent || ""})];
    if (!isElement(node)) return [];
    if (node.tagName === "BR") return [new TextRun({break: 1})];
    if (node.tagName === "IMG") {
      const img = node as HTMLImageElement;
      const pic = pictures.get(img.dataset.source!)!;
      const width = Math.min(Number(img.dataset.width) || pic.width, 600);
      return [new ImageRun({type: pic.type, data: pic.data, transformation: {
        width, height: Math.max(1, Math.round(pic.height * width / pic.width))
      }})];
    }
    const next = {...style};
    if (node.matches("strong,b")) next.bold = true;
    if (node.matches("em,i")) next.italics = true;
    if (node.matches("s,del")) next.strike = true;
    if (node.matches("code")) next.font = "Consolas";
    const children = Array.from(node.childNodes).flatMap(n => inline(n, next));
    if (node.tagName === "A") return [new ExternalHyperlink({link: node.getAttribute("href")!, children})];
    return children;
  }

  type Block = Paragraph | Table;
  function blocks(container: Element, depth = 0, options: IParagraphOptions = {}, first?: IParagraphOptions): Block[] {
    const out: Block[] = [];
    let runs: ParagraphChild[] = [];
    const flush = () => {
      if (runs.length) out.push(new Paragraph({...options, ...(!out.length && first), children: runs}));
      runs = [];
    };
    for (const node of container.childNodes) {
      if (!isElement(node)) {
        if (node.textContent?.trim() || runs.length) runs.push(...inline(node));
        continue;
      }
      if (node.matches("ul,ol")) {
        flush();
        const reference = "list-" + numbering.length;
        const level = Math.min(depth, 8);
        const ordered = node.tagName === "OL";
        numbering.push({reference, levels: [{level, format: ordered ? LevelFormat.DECIMAL : LevelFormat.BULLET,
          text: ordered ? "%" + (level + 1) + "." : "•", start: Number(node.getAttribute("start") || 1),
          style: {paragraph: {indent: {left: (level + 1) * 360, hanging: 240}}}}]});
        for (const li of node.children) {
          out.push(...blocks(li, depth + 1, options, {numbering: {reference, level}}));
        }
      } else if (node.tagName === "BLOCKQUOTE") {
        flush(); out.push(...blocks(node, depth, {...options, style: "Quote", indent: {left: 360}}));
      } else if (node.tagName === "TABLE") {
        flush();
        out.push(new Table({rows: Array.from((node as HTMLTableElement).rows, row =>
          new TableRow({children: Array.from(row.cells, cell => new TableCell({children: blocks(cell)}))}))}));
      } else if (node.matches("p,h1,h2,h3,h4,h5,h6,pre,hr")) {
        flush();
        const heading = /^H[1-6]$/.test(node.tagName) ? HeadingLevel[("HEADING_" + node.tagName[1]) as keyof typeof HeadingLevel] : undefined;
        out.push(new Paragraph({...options, ...(!out.length && first), heading, children: inline(node)}));
      } else runs.push(...inline(node));
    }
    flush();
    return out;
  }
  const children = blocks(body);
  return Packer.toBlob(new WordDocument({title, numbering: {config: numbering}, sections: [{children}]}));
}
