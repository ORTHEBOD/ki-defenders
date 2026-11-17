"""Cuts the user's gear sheet (art_sources/sheets_2026-11-17/gear.jpg: 6 x 6 pictures on white, one row per
slot, weakest on the left) into art/gear/<item id>.png with a see-through background.

The rows are in the order of GEAR_SLOTS in src/data/shop.js (weapon, armor, pants, boots, amulet, accessory)
and the columns in tier order, so the ids below follow src/data/shop.js GEAR.

    python tools/cut_gear.py
"""
import os

import numpy as np
from PIL import Image
from scipy import ndimage

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(PROJECT, "art_sources", "sheets_2026-11-17", "gear.jpg")
OUT = os.path.join(PROJECT, "art", "gear")
SIZE = 128  # the longest side of each picture

ROWS = [
    ["trainingGloves", "powerBracers", "dragonGauntlets", "titanFists", "thunderGauntlets", "godFists"],
    ["clothVest", "battleArmor", "divineArmor", "titanPlate", "phoenixArmor", "celestialArmor"],
    ["trainingPants", "weightedPants", "dragonPants", "titanLeggings", "stormPants", "celestialPants"],
    ["sandals", "windBoots", "cloudBoots", "thunderBoots", "phoenixBoots", "lightBoots"],
    ["kiCharm", "spiritPendant", "dragonPearl", "titanSeal", "phoenixHeart", "godStar"],
    ["scouter", "healingBand", "luckyCoin", "eagleScouter", "phoenixBand", "dragonCoin"],
]


def cut_cell(rgb: np.ndarray) -> Image.Image:
    """The picture in one cell: the white around it (anything near-white that touches the cell's edge) is made
    see-through, with soft edges so glows fade out instead of ending in a white box."""
    d = 255 - rgb.min(axis=2).astype(np.int32)  # how far from white
    near_white = d < 40
    labels, _ = ndimage.label(near_white)
    edge = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    background = np.isin(labels, list(edge))
    # Pure white holes inside an item (the loop of a cord) are background too
    for i in set(range(1, labels.max() + 1)) - edge:
        hole = labels == i
        if hole.sum() > 150 and d[hole].mean() < 6:
            background |= hole
    a = np.where(background, np.clip((d - 4) / 70, 0, 1), 1.0)
    # A glow is its color mixed with the white page: take the white back out, so it glows on dark menus too
    rgb = np.where(background[..., None],
                   255 - (255 - rgb.astype(np.float32)) / np.maximum(a, 1e-3)[..., None], rgb)
    rgb = np.clip(rgb, 0, 255).astype(np.uint8)
    alpha = (a * 255).astype(np.uint8)
    # Drop specks (sparkles far from the item)
    solid = alpha > 60
    labels, n = ndimage.label(ndimage.binary_dilation(solid, iterations=3))
    if n > 1:
        sizes = ndimage.sum(solid, labels, range(1, n + 1))
        keep = np.isin(labels, [i + 1 for i in range(n) if sizes[i] > sizes.max() * 0.04])
        alpha = np.where(keep, alpha, 0).astype(np.uint8)
    ys, xs = np.nonzero(alpha > 20)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgba = np.dstack([rgb, alpha])[y0:y1, x0:x1]
    im = Image.fromarray(rgba, "RGBA")
    s = SIZE / max(im.size)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)


def main() -> None:
    sheet = np.asarray(Image.open(SHEET).convert("RGB"))
    h, w, _ = sheet.shape
    os.makedirs(OUT, exist_ok=True)
    contact = Image.new("RGBA", (6 * (SIZE + 8), 6 * (SIZE + 8)), (16, 19, 28, 255))
    for r, ids in enumerate(ROWS):
        for c, item in enumerate(ids):
            cell = sheet[r * h // 6:(r + 1) * h // 6, c * w // 6:(c + 1) * w // 6]
            im = cut_cell(cell)
            # 256 colors keeps the soft edges and makes the files 3x smaller (the app has a size limit)
            im.quantize(256, method=Image.Quantize.FASTOCTREE).save(os.path.join(OUT, item + ".png"), optimize=True)
            contact.paste(im, (c * (SIZE + 8) + (SIZE - im.width) // 2, r * (SIZE + 8) + (SIZE - im.height) // 2), im)
            print(item, im.size)
    contact.save(os.path.join(PROJECT, "art_sources", "gear_contact.png"))


if __name__ == "__main__":
    main()
