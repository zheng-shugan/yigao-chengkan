import { App, requestUrl, TFile } from "obsidian";

export async function readPicture(app: App, file: TFile, source: string) {
  let bytes: ArrayBuffer;
  let type = "";
  if (/^https?:\/\//i.test(source)) {
    const response = await requestUrl(source);
    bytes = response.arrayBuffer;
    type = response.headers["content-type"]?.split(";")[0] || "";
  } else {
    let path = source;
    try { path = decodeURIComponent(path); } catch { /* Literal percent in a vault filename. */ }
    const attachment = app.metadataCache.getFirstLinkpathDest(path, file.path);
    if (!attachment) throw new Error("找不到本地附件");
    bytes = await app.vault.readBinary(attachment);
    type = attachment.extension.toLowerCase() === "svg" ? "image/svg+xml" : "";
  }
  return new Blob([bytes], { type });
}
