// Proof sheet of 100% crops, to check cutout edges at the size they could really be seen.
import sharp from "sharp";
import path from "node:path";

const [dir, out, stage = "#EEF1F4"] = process.argv.slice(2);
// name, then the crop's centre as a fraction of the picture.
const SPOTS = [
  ["m1-pearl-white", 0.85, 0.72], ["m1-pearl-white", 0.3, 0.4], ["legacy-arctic-white", 0.55, 0.25],
  ["legacy-arctic-white", 0.5, 0.9], ["miso-cream-white", 0.85, 0.72], ["miso-cream-white", 0.75, 0.12],
  ["e70-red", 0.25, 0.85], ["e70-red", 0.7, 0.98], ["e125-red", 0.1, 0.72], ["e125-black", 0.5, 0.92],
  ["bolt-graphite-grey", 0.75, 0.55], ["miso3w-blush-pink", 0.7, 0.18],
];
const S = 500, cols = 4;
const comps = [];
for (const [i, [name, fx, fy]] of SPOTS.entries()) {
  const file = path.join(dir, `${name}.png`);
  const { width, height } = await sharp(file).metadata();
  const size = Math.min(S, width, height);
  const left = Math.max(0, Math.min(width - size, Math.round(width * fx - size / 2)));
  const top = Math.max(0, Math.min(height - size, Math.round(height * fy - size / 2)));
  const input = await sharp(file).extract({ left, top, width: size, height: size }).resize(S, S).png().toBuffer();
  comps.push({ input, left: (i % cols) * S, top: Math.floor(i / cols) * S });
  comps.push({ input: Buffer.from(`<svg width="${S}" height="24"><text x="6" y="17" font-size="15" fill="#c00" font-family="sans-serif">${name}</text></svg>`), left: (i % cols) * S, top: Math.floor(i / cols) * S });
}
await sharp({ create: { width: cols * S, height: Math.ceil(SPOTS.length / cols) * S, channels: 3, background: stage } }).composite(comps).jpeg({ quality: 88 }).toFile(out);
