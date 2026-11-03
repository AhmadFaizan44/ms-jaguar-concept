"""Rebuilds the vehicle photos from the full-resolution studio originals.

BiRefNet finds the solid vehicle. Everything outside it is un-multiplied against the white
studio, so floor shadows and reflections stay exactly as photographed, with no hard cut lines,
and sit naturally on any pale stage colour.

Usage: python cut_vehicles.py <source dir> <output dir> [name ...]
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage

# Stop printed titles and spec bars: everything outside these limits is erased.
# floor_end: fraction of the vehicle height, measured from the wheels, kept below the vehicle.
DEFAULT_FLOOR = 0.16
OPTIONS = {
    "e70-red": {"floor_end": 0.1},
    "e70-black": {"floor_end": 0.1},
    "e70s-red": {"floor_end": 0.1},
    "e70s-black": {"floor_end": 0.1},
    "e70s-blue": {"floor_end": 0.1},
    "miso-cream-white": {"floor_end": 0.08},
    "miso3w-blush-pink": {"floor_end": 0.08},
}


def largest_with_neighbours(mask):
    """The vehicle: the largest solid shape plus small parts inside its bounds (mirrors, stalks)."""
    labels, count = ndimage.label(mask)
    if count == 0:
        return mask
    sizes = ndimage.sum(mask, labels, range(1, count + 1))
    main = int(np.argmax(sizes)) + 1
    ys, xs = np.where(labels == main)
    top, bottom, left, right = ys.min(), ys.max(), xs.min(), xs.max()
    keep = labels == main
    for index, box in enumerate(ndimage.find_objects(labels), start=1):
        if index == main or sizes[index - 1] < 40:
            continue
        inside = box[0].start >= top and box[0].stop <= bottom and box[1].start >= left and box[1].stop <= right
        if inside:
            keep |= labels == index
    return keep


def cut(path, out_dir, session):
    name = path.stem
    options = OPTIONS.get(name, {})
    source = Image.open(path).convert("RGBA")
    white = Image.new("RGBA", source.size, (255, 255, 255, 255))
    rgb = np.asarray(Image.alpha_composite(white, source).convert("RGB")).astype(np.float32) / 255

    matte = remove(Image.fromarray((rgb * 255).astype(np.uint8)), session=session, only_mask=True)
    matte = np.asarray(matte).astype(np.float32) / 255

    solid = largest_with_neighbours(matte > 0.5)
    # Tighten the upscaled matte so soft model edges don't carry white into the vehicle's outline.
    grown = ndimage.binary_dilation(solid, iterations=3)
    vehicle = np.clip((matte - 0.35) / 0.5, 0, 1) * grown
    vehicle = vehicle * vehicle * (3 - 2 * vehicle)

    # Everything else un-multiplied from white: the alpha that reproduces the photo on white.
    floor_alpha = 1 - rgb.min(axis=2)
    floor_alpha = np.clip((floor_alpha - 0.012) / 0.988, 0, 1)

    ys, xs = np.where(solid)
    top, bottom, left, right = ys.min(), ys.max(), xs.min(), xs.max()
    height, width = solid.shape
    limit = min(height, bottom + int((bottom - top) * options.get("floor_end", DEFAULT_FLOOR)))
    margin = int((right - left) * 0.08)
    row, column = np.mgrid[0:height, 0:width]
    # Floor effects only: below the vehicle's middle, fading out before the printed spec bars.
    middle = top + (bottom - top) * 0.5
    fade = np.clip((limit - row) / max(1, (limit - bottom) * 0.45), 0, 1)
    floor_zone = (row > middle) & (column > left - margin) & (column < right + margin)
    floor_alpha = floor_alpha * floor_zone * fade

    alpha = np.maximum(vehicle, floor_alpha)
    safe = np.maximum(alpha, 1e-3)[..., None]
    colour = np.clip((rgb - (1 - alpha[..., None])) / safe, 0, 1)
    # Inside the vehicle keep the photo's own colours untouched.
    inner = ndimage.binary_erosion(solid, iterations=4)[..., None]
    colour = np.where(inner, rgb, colour)
    alpha = np.where(inner[..., 0], 1, alpha)

    rgba = np.dstack([colour, alpha])
    image = Image.fromarray((rgba * 255 + 0.5).astype(np.uint8), "RGBA")
    box = image.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
    image.crop(box).save(out_dir / f"{name}.png", compress_level=3)
    print(name, source.size, "->", image.crop(box).size, flush=True)


def main():
    source_dir, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)
    wanted = set(sys.argv[3:])
    session = new_session("birefnet-general")
    for path in sorted(source_dir.iterdir()):
        if path.suffix.lower() in {".png", ".jpg", ".jpeg"} and (not wanted or path.stem in wanted):
            cut(path, out_dir, session)


if __name__ == "__main__":
    main()
