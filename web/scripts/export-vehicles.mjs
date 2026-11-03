// Turns the rebuilt masters in assets-cut/ into pre-sized AVIF and WebP for the page.
// Also records each photo's size and where its wheels meet the ground.
import sharp from "sharp";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const SRC = "assets-cut";
const OUT = "public/vehicles";
const WIDTHS = [800, 1400, 2000];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const manifest = {};
for (const file of (await readdir(SRC)).filter((f) => f.endsWith(".png")).sort()) {
  const name = path.parse(file).name;
  const input = path.join(SRC, file);
  const { width, height } = await sharp(input).metadata();

  // The lowest row of solid pixels is the tyre on the ground; below it only shadow or reflection.
  const { data, info } = await sharp(input).extractChannel("alpha").resize({ width: 400 }).raw().toBuffer({ resolveWithObject: true });
  let groundRow = info.height - 1;
  for (let y = info.height - 1; y >= 0; y--) {
    let solid = 0;
    for (let x = 0; x < info.width; x++) if (data[y * info.width + x] > 240) solid++;
    if (solid >= 6) { groundRow = y; break; }
  }

  const widths = WIDTHS.filter((w) => w < width);
  if (widths.length === 0 || width < WIDTHS[widths.length] * 0.9) widths.push(width);
  for (const w of widths) {
    const base = sharp(input).resize({ width: w });
    await base.clone().avif({ quality: 62, effort: 4 }).toFile(path.join(OUT, `${name}-${w}.avif`));
    await base.clone().webp({ quality: 84, alphaQuality: 90, effort: 5 }).toFile(path.join(OUT, `${name}-${w}.webp`));
  }
  manifest[name] = { width, height, widths, ground: Number((1 - (groundRow + 1) / info.height).toFixed(4)) };
  console.log(name, widths.join("/"), "ground", manifest[name].ground);
}
await writeFile("src/data/vehicle-images.json", JSON.stringify(manifest, null, 2));
