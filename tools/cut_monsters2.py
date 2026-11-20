"""Cuts the surprise monsters out of the user's sheets (art_sources/sheets_2026-11-20):
Shield Knight and Golden Goblin with 5 walking frames (monsters_frames.jpg), Split Slime and Mini Slime with 2
(monsters.jpg), and the 4 pets with 2 frames each (pets_clean.jpg). Like tools/cut_monsters.py: art/<key>.png, art/<key>_1.png ... on one canvas, bottom-centered,
facing right.

Run: python tools/cut_monsters2.py [--sheet out.png]
"""
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
import cut_heroes  # noqa: E402

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cut_heroes.SHEETS = os.path.join(PROJECT, "art_sources", "sheets_2026-11-20")
OUT = os.path.join(PROJECT, "art")

# key: (sheet, boxes in sheet pixels, how far from white is still background, flip to face right)
MONSTERS = {
    "shieldKnight": ("monsters_frames.jpg", [(25, 517, 115, 629), (124, 517, 211, 629), (221, 517, 312, 628),
                                             (320, 517, 411, 628), (420, 517, 509, 628)], 48, False),
    "goldGoblin": ("monsters_frames.jpg", [(886, 663, 967, 755), (981, 663, 1063, 756), (1078, 663, 1160, 756),
                                           (1176, 663, 1258, 756), (1270, 663, 1352, 756)], 48, False),
    "splitSlime": ("monsters.jpg", [(409, 604, 529, 687), (566, 596, 700, 687)], 30, False),
    "miniSlime": ("monsters.jpg", [(768, 629, 851, 686), (893, 634, 969, 685)], 30, False),
    "pet_dragon": ("pets_clean.jpg", [(94, 41, 308, 311), (413, 72, 638, 281)], 30, False),
    "pet_kitten": ("pets_clean.jpg", [(746, 59, 971, 284), (1046, 86, 1272, 284)], 30, False),
    "pet_turtle": ("pets_clean.jpg", [(145, 450, 324, 647), (414, 526, 638, 670)], 30, False),
    "pet_fox": ("pets_clean.jpg", [(753, 442, 959, 680), (1027, 508, 1267, 682)], 30, False),
    # Sky Temple (levels 61-75)
    "cloudSpirit": ("monsters_frames.jpg", [(22, 21, 141, 109), (159, 17, 270, 108), (293, 26, 408, 114),
                                            (422, 35, 544, 116), (555, 22, 684, 129)], 48, False),
    "windMonkey": ("monsters_frames.jpg", [(22, 145, 148, 267), (156, 145, 281, 269), (284, 145, 411, 269),
                                           (413, 145, 541, 268), (552, 145, 676, 271)], 48, False),
    "gargoyle": ("monsters.jpg", [(698, 58, 839, 170), (855, 66, 975, 178)], 30, False),
    "thunderMonk": ("monsters_frames.jpg", [(760, 151, 863, 269), (889, 150, 983, 270), (1012, 150, 1104, 269),
                                            (1129, 151, 1225, 268), (1251, 150, 1355, 268)], 48, False),
    "stormEagle": ("monsters_frames.jpg", [(18, 281, 199, 485), (199, 275, 365, 486), (378, 323, 540, 481),
                                           (550, 344, 744, 457)], 48, False),
    "skyEmperor": ("monsters_frames.jpg", [(750, 327, 858, 489), (865, 327, 973, 489), (984, 327, 1092, 489),
                                           (1105, 327, 1228, 489)], 48, False),
}
# White inside the figure is part of it: the slimes' glowing cracks, the white kitten and its cloud
SOLID = {"splitSlime", "miniSlime", "cloudSpirit", "pet_kitten", "pet_turtle", "pet_fox", "pet_dragon"}


def pad(box, n=4):
    return (box[0] - n, box[1] - n, box[2] + n, box[3] + n)


def frames(key):
    sheet, boxes, lim, flip = MONSTERS[key]
    figs = [cut_heroes.cut(sheet, pad(box), lim=lim, keep=0.08, holes=key not in SOLID) for box in boxes]
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
        out = Image.new("RGBA", (cw * 5, ch * len(rows)), (60, 120, 70, 255))
        for k, r in enumerate(rows):
            for i, p in enumerate(r):
                out.paste(p, (i * cw, k * ch), p)
        out.save(sheet)


if __name__ == "__main__":
    main()
