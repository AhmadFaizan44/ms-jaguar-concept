// Proof sheet: cutouts on the pale stage colour, plus 100% zoom crops of chosen spots.
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const [dir, out, stage = "#F1F3F5", cols = "5"] = process.argv.slice(2);
const files = (await readdir(dir)).filter((f) => f.endsWith(".png")).sort();
const W = 420, H = 420, c = Number(cols);
const comps = [];
for (const [i, f] of files.entries()) {
  const input = await sharp(path.join(dir, f)).resize(W - 20, H - 40, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  comps.push({ input, left: (i % c) * W + 10, top: Math.floor(i / c) * H + 30 });
  comps.push({ input: Buffer.from(`<svg width="${W}" height="26"><text x="8" y="18" font-size="15" fill="#333" font-family="sans-serif">${f.replace(".png", "")}</text></svg>`), left: (i % c) * W, top: Math.floor(i / c) * H });
}
await sharp({ create: { width: c * W, height: Math.ceil(files.length / c) * H, channels: 3, background: stage } }).composite(comps).jpeg({ quality: 88 }).toFile(out);
