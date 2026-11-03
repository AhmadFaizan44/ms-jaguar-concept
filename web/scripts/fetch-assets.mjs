// Downloads the MS Jaguar source photos from their Shopify CDN into assets-src/.
import { writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";

const CDN = "https://cdn.shopify.com/s/files/1/0416/3200/6312/files/";
const OUT = path.resolve("assets-src");

// Name on disk -> file on the CDN.
// Legacy's CDN filenames are swapped: "Arctic_white" is the grey scooter, "titanium_grey" the white one.
const FILES = {
  "miso-blush-pink.jpg": "18CC73EE-EADB-4842-A939-C44F0AD4F917.jpg",
  "miso-deep-black.jpg": "A5D11A8B-DED9-4DF8-A5A8-CE5843041194.jpg",
  "miso-cream-white.jpg": "IMG-0207.jpg",
  "bolt-midnight-black.jpg": "79CA3A6C-88F6-4719-A302-462E5E10B4B7.jpg",
  "bolt-graphite-grey.jpg": "15052350-6BE8-491E-8ABA-15132D6568B7.jpg",
  "m1-pearl-white.jpg": "107C70F6-A022-4F99-BAB3-F81D07CD50F4.jpg",
  "m1-crimson-black.jpg": "962A7BDA-72AA-4B88-9FAE-37E21B2B874E.jpg",
  "m1-matte-black.jpg": "B13FF8A9-DC54-4A53-94C5-C674C75B1EBB.jpg",
  "legacy-arctic-white.png": "MS_Jaguar_Legacy_best_looking_Electric_scooter_titanium_grey.png",
  "legacy-titanium-grey.png": "MS_Jaguar_Legacy_best_looking_Electric_scooter_Arctic_white.png",
  "legacy-midnight-black.png": "MS_Jaguar_Legacy_best_looking_Electric_scooter_midnight_black.png",
  "miso3w-blush-pink.png": "Miso_electric_3_wheeler_in_Pakistan.png",
  "e70-red.png": "MS_Jaguar_Electric_Bike_E-70_Red.png",
  "e70-black.png": "MS_Jaguar_Electric_Bike_E-70_Black.png",
  "e70s-red.png": "MS_Jaguar_Electric_Bike_E-70_Supreme_Red.png",
  "e70s-black.png": "MS_Jaguar_Electric_Bike_E-70_Supreme_Black.png",
  "e70s-blue.png": "MS_Jaguar_Electric_Bike_E-70_Supreme_Blue.png",
  "e125-red.png": "MS_Jaguar_E-125_RED_Electric_Bike.png",
  "e125-black.png": "MS_Jaguar_E-125_Black_Electric_Bike.png",
};

await mkdir(OUT, { recursive: true });
for (const [name, file] of Object.entries(FILES)) {
  const target = path.join(OUT, name);
  try { await access(target); continue; } catch {}
  const res = await fetch(CDN + file);
  if (!res.ok) { console.error("FAILED", name, res.status); continue; }
  await writeFile(target, Buffer.from(await res.arrayBuffer()));
  console.log("ok", name);
}
