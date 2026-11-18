"""Cuts the Frozen Peaks and Volcano monsters out of the user's sheet (art_sources/sheets_2026-11-18/monsters.jpg).

Each monster gets its walking frames: art/<key>.png, art/<key>_1.png ... all on the same canvas
(bottom-centered), so the game shrinks them alike and can swap them while the monster walks.
All pictures face right, like the drawn enemies.

Run: python tools/cut_monsters.py [--sheet out.png]
"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(__file__))
import cut_heroes  # noqa: E402

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cut_heroes.SHEETS = os.path.join(PROJECT, "art_sources", "sheets_2026-11-18")
OUT = os.path.join(PROJECT, "art")
SHEET = "monsters.jpg"

# key: (boxes in sheet pixels, white holes are background, flip to face right)
MONSTERS = {
    "snowImp": ([(66, 63, 137, 135)], True, False),
    "iceGolem": ([(154, 42, 256, 142), (261, 42, 363, 142)], True, False),
    "frostBat": ([(909, 194, 981, 254), (978, 197, 1079, 252)], True, False),
    "yetiCub": ([(1073, 44, 1151, 138), (1073, 180, 1151, 274)], False, False),
    "lavaSlime": ([(54, 342, 149, 435)], True, False),
    "fireHound": ([(162, 348, 258, 433), (261, 348, 366, 433), (367, 348, 471, 433), (468, 348, 572, 431)], True, False),
    "magmaBrute": ([(986, 335, 1067, 433)], True, False),
    "emberWisp": ([(69, 478, 126, 553), (178, 477, 240, 553)], True, False),
    "frostGiant": ([(617, 43, 724, 142), (724, 43, 814, 142)], True, False),
    "iceQueen": ([(280, 597, 379, 720), (385, 598, 485, 721)], True, False),
    "lavaTitan": ([(616, 597, 720, 720), (615, 735, 719, 858)], True, False),
    "pyrax": ([(981, 603, 1060, 716), (980, 749, 1062, 855)], True, False),
}

FIERY = {"lavaSlime", "fireHound", "magmaBrute", "emberWisp", "lavaTitan", "pyrax"}


def frames(key):
    boxes, holes, flip = MONSTERS[key]
    figs = [cut_heroes.cut(SHEET, box, lim=30, keep=0.08, holes=holes) for box in boxes]
    if key in FIERY:
        # Fire monsters have no white in them: white bits left between arm and body are background
        for f in figs:
            px = np.array(f)
            white = px[..., :3].min(axis=2) > 205
            px[..., 3][white] = 0
            f.putalpha(Image.fromarray(px[..., 3]).filter(ImageFilter.MinFilter(3)))
    if flip:
        figs = [f.transpose(Image.FLIP_LEFT_RIGHT) for f in figs]
    w = max(f.width for f in figs) + 8
    h = max(f.height for f in figs) + 4
    out = []
    for f in figs:
        c = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        c.paste(f, ((w - f.width) // 2, h - 2 - f.height), f)
        out.append(c)
    return out


def main():
    sheet = sys.argv[sys.argv.index("--sheet") + 1] if "--sheet" in sys.argv else None
    rows = []
    for key in MONSTERS:
        pics = frames(key)
        for i, p in enumerate(pics):
            p.save(os.path.join(OUT, f"{key}{'' if i == 0 else f'_{i}'}.png"), optimize=True)
        rows.append(pics)
        print(key, len(pics), pics[0].size)
    if sheet:
        cw = max(p.width for r in rows for p in r) + 10
        ch = max(p.height for r in rows for p in r) + 10
        out = Image.new("RGBA", (cw * 4 * 3, ch * 4), (60, 120, 70, 255))
        for k, r in enumerate(rows):
            x0, y0 = (k % 3) * cw * 4, (k // 3) * ch
            for i, p in enumerate(r):
                out.paste(p, (x0 + i * cw, y0), p)
        out.save(sheet)


if __name__ == "__main__":
    main()
