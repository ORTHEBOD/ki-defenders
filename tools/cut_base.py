"""Cuts the user's base sheet (art_sources/sheets_2026-11-17/Base.jpg) into art/base_<walls level>.png (6 stages,
igloo to crystal castle) and art/cannon_<level>.png (5 cannons), with a see-through background.

    python tools/cut_base.py
"""
import os

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(PROJECT, "art_sources", "sheets_2026-11-17", "Base.jpg")
OUT = os.path.join(PROJECT, "art")
# (top, bottom) of each row in the sheet, name, how many pictures, longest side when saved
ROWS = [((90, 390), "base", 6, 300), ((450, 690), "cannon", 5, 160)]


def cut_row(img, top, bottom, count, lim):
    strip = img.crop((0, top, img.width, bottom))
    rgb = np.array(strip).astype(np.int32)
    d = 255 - rgb.min(axis=2)
    lab, _ = ndimage.label(d <= lim)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(edge))
    parts, n = ndimage.label(fg)
    sizes = ndimage.sum(np.ones_like(parts), parts, range(1, n + 1))
    biggest = sorted(np.argsort(sizes)[::-1][:count] + 1, key=lambda i: ndimage.center_of_mass(parts == i)[1])
    # Small pieces close to a picture (a flag, a fence post) belong to it
    out = []
    for i in biggest:
        mask = parts == i
        near = ndimage.binary_dilation(mask, iterations=12)
        for j in range(1, n + 1):
            if j not in biggest and sizes[j - 1] > 30 and (near & (parts == j)).any():
                mask |= parts == j
        a = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
        pic = strip.convert("RGBA")
        pic.putalpha(a)
        out.append(pic.crop(Image.fromarray((mask * 255).astype(np.uint8)).getbbox()))
    return out


def main():
    img = Image.open(SHEET).convert("RGB")
    img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
    for (top, bottom), name, count, size in ROWS:
        # The crystal castle's glass dome is very pale: only nearly pure white is background in the base row
        for k, pic in enumerate(cut_row(img, top * 2, bottom * 2, count, 14 if name == "base" else 30)):
            pic.thumbnail((size, size), Image.LANCZOS)
            level = k if name == "base" else k + 1
            pic.quantize(256, Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(
                os.path.join(OUT, f"{name}_{level}.png"), optimize=True)
            print(f"{name}_{level}", pic.size)


if __name__ == "__main__":
    main()
