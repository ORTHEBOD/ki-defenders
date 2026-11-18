"""Gets every hero picture (art/hero_*.png) ready to wear gear. Writes:
  art/hero_masks/<key>.png  - which pixels are the gi top (80), the gi pants (160) and the boots (240).
                              Armor, pants and boots recolor those pixels in the item's color, keeping the shading.
  src/data/heroAnchors.js   - where the small pieces are pasted on, in the picture's pixels:
                              face [middle x, top y, width, height] (band, scouter, amulet under the chin),
                              belt [middle x, y, width] (lucky coin), fists [[x, y, size], ...] (gloves).
A contact sheet of every picture wearing gear (the same rules as wearOnPicture in src/art/fighterArt.js):

    python tools/hero_anchors.py [--sheet out.png]
"""
import glob
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(PROJECT, "art")
MASKS = os.path.join(ART, "hero_masks")
OUT = os.path.join(PROJECT, "src", "data", "heroAnchors.js")
TORSO, LEGS, BOOTS = 80, 160, 240


def lum(r, g, b):
    return 0.3 * r + 0.59 * g + 0.11 * b


def gi_mask(hero, r, g, b):
    if hero == "zenko":  # red gi
        return (r > 120) & (r > g * 1.7) & (r > b * 1.7)
    if hero == "mira":  # teal gi
        return (g > r + 30) & (b > r + 15)
    if hero == "goran":  # very dark green gi
        return (g >= r - 3) & (g > b + 2) & (lum(r, g, b) < 120)
    # Sora: white gi with lavender shade (not the light-blue ki ball)
    mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
    return (mx - mn < 0.24 * mx) & (lum(r, g, b) > 105) & (b - r < 35)


def boot_mask(hero, r, g, b):
    mx = np.maximum(np.maximum(r, g), b)
    if hero == "zenko":
        return mx < 75
    if hero == "mira":
        return (mx < 95) & (b >= r)
    if hero == "goran":
        return (r >= g) & (g >= b) & (mx < 140) & (r - b > 12)
    return (b > g + 25) & (r > g + 5)  # Sora: purple boots


def belt_mask(hero, r, g, b):
    if hero == "goran":  # gold belt
        return (r > 120) & (g > 90) & (b < 90) & (r - b > 60) & (g - b > 30) & (r - g < 70)
    if hero == "sora":  # purple belt
        return (b > 90) & (r > 70) & (g < r - 15) & (b > g + 30)
    return np.maximum(np.maximum(r, g), b) < 80  # Zenko (black), Mira (dark navy)


def skin_mask(r, g, b):
    return (r > 140) & (g > 85) & (b > 50) & (r > g + 12) & (g > b + 5) & (r - b > 45) & (r - b < 150)


def blobs_of(mask, min_size=60):
    lab, n = ndimage.label(mask)
    out = []
    for i in range(1, n + 1):
        yy, xx = np.nonzero(lab == i)
        if len(yy) >= min_size:
            out.append({"n": len(yy), "x0": xx.min(), "x1": xx.max(), "y0": yy.min(), "y1": yy.max(),
                        "cx": xx.mean(), "cy": yy.mean(), "xx": xx, "yy": yy})
    return out


def pick_face(blobs, top, height, dark):
    """The face: a roundish skin blob in the upper part of the figure with dark bits (eyes) inside"""
    best, score = None, -1
    for bl in blobs:
        if bl["cy"] > top + height * 0.55:
            continue
        w, h = bl["x1"] - bl["x0"] + 1, bl["y1"] - bl["y0"] + 1
        fill = bl["n"] / (w * h)
        aspect = w / h
        eyes = dark[bl["y0"]:bl["y1"] + 1, bl["x0"]:bl["x1"] + 1].mean()
        if not 0.55 < aspect < 1.9 or eyes < 0.02:
            continue
        s = bl["n"] * fill * (1.5 - abs(1 - aspect)) * (1 + eyes * 4) * (1.3 - (bl["cy"] - top) / height)
        if s > score:
            best, score = bl, s
    return best or max(blobs, key=lambda bl: bl["n"] if bl["cy"] < top + height * 0.5 else 0)


# Goran's bare arms are skin too, so his face is not found by itself: [middle x, top y, width, height]
GORAN_FACES = {
    "hero_goran_0": [188, 32, 50, 58], "hero_goran_0_attack": [352, 140, 40, 50], "hero_goran_0_run": [355, 35, 45, 55],
    "hero_goran_1": [185, 60, 45, 55], "hero_goran_1_attack": [330, 140, 40, 55], "hero_goran_1_run": [318, 60, 40, 50],
    "hero_goran_2": [195, 55, 50, 50], "hero_goran_2_attack": [258, 55, 40, 55], "hero_goran_2_run": [318, 55, 40, 50],
    "hero_goran_3": [200, 70, 50, 50], "hero_goran_3_attack": [192, 80, 50, 55], "hero_goran_3_run": [318, 72, 40, 50],
    "hero_goran_4": [195, 60, 45, 50], "hero_goran_4_attack": [295, 65, 40, 50], "hero_goran_4_run": [318, 55, 40, 50],
    "hero_goran_5": [188, 60, 45, 50], "hero_goran_5_attack": [290, 85, 40, 50], "hero_goran_5_run": [318, 55, 40, 50],
}


def find(path):
    key = os.path.basename(path)[:-4]
    hero = key.split("_")[1]
    im = np.array(Image.open(path).convert("RGBA")).astype(np.int32)
    r, g, b, a = im[..., 0], im[..., 1], im[..., 2], im[..., 3]
    body = a > 128
    ys, _ = np.nonzero(body)
    top, bottom = ys.min(), ys.max()
    height = bottom - top
    rows = np.arange(body.shape[0])[:, None]
    light = lum(r, g, b)

    skin = ndimage.binary_opening(skin_mask(r, g, b) & body, iterations=1)
    blobs = blobs_of(skin)
    dark = (light < 70) & body
    if key in GORAN_FACES:
        cx, y0, w, h = GORAN_FACES[key]
        face = {"cx": cx, "x0": cx - w / 2, "x1": cx + w / 2, "y0": y0, "y1": y0 + h, "n": 0}
        # His arms are the fists' blobs; anything overlapping the face is not a fist
        blobs = [bl for bl in blobs if not (bl["x0"] < cx < bl["x1"] and bl["y0"] < y0 + h / 2 < bl["y1"])]
    else:
        face = pick_face(blobs, top, height, dark)
    fw, fh = face["x1"] - face["x0"], face["y1"] - face["y0"]
    chin = face["y1"]

    belt = belt_mask(hero, r, g, b) & body & (rows > chin + fh * 0.25) & (rows < top + height * 0.85)
    by, bx = np.nonzero(belt)
    if len(by) > 30:
        smooth = np.convolve(np.bincount(by, minlength=body.shape[0]), np.ones(9), "same")
        belt_y = int(np.argmax(smooth))
        near = np.abs(by - belt_y) < 12
        bx0, bx1 = np.percentile(bx[near], 5), np.percentile(bx[near], 95)
    else:
        belt_y = int((chin + bottom) / 2)
        bx0, bx1 = face["cx"] - fw * 0.6, face["cx"] + fw * 0.6

    # Recolor regions: the gi above and below the belt, and the boots at the bottom
    outline = light < (12 if hero == "goran" else 28)
    gi = gi_mask(hero, r, g, b) & body & ~outline & ~skin
    torso = gi & (rows > chin) & (rows < belt_y)
    boots = boot_mask(hero, r, g, b) & body & ~outline & (rows > bottom - height * 0.16) & ~skin
    legs = gi & (rows >= belt_y) & ~boots
    # Sora's white gi: the eyes and the ki ball are white too; only big connected parts are gi
    for m in (torso, legs, boots):
        lab, n = ndimage.label(m)
        if n:
            sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
            m &= np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= 40])
    mask = np.zeros(body.shape, np.uint8)
    mask[torso] = TORSO
    mask[legs] = LEGS
    mask[boots] = BOOTS
    os.makedirs(MASKS, exist_ok=True)
    Image.fromarray(mask, "L").save(os.path.join(MASKS, key + ".png"), optimize=True)

    # Fists: the far end of each skin blob below the face (a fist, or the end of a bare arm)
    mid_x, mid_y = (bx0 + bx1) / 2, (chin + belt_y) / 2
    fists = []
    for bl in sorted([bl for bl in blobs if bl is not face and bl["cy"] > face["y0"] - fh], key=lambda bl: -bl["n"])[:2]:
        d = (bl["xx"] - mid_x) ** 2 + (bl["yy"] - mid_y) ** 2
        k = np.argsort(d)[-max(8, len(d) // 6):]
        x, y = bl["xx"][k].mean(), bl["yy"][k].mean()
        size = min(max(bl["x1"] - bl["x0"], bl["y1"] - bl["y0"]), fw * 0.55)
        fists.append([round(float(x)), round(float(y)), round(float(max(size, fw * 0.32)))])
    fists.sort()

    return key, {"face": [round(face["cx"]), int(face["y0"]), int(fw), int(fh)],
                 "belt": [round((bx0 + bx1) / 2), belt_y, round(max(bx1 - bx0, fw * 0.8))], "fists": fists}


# ---------- The same rules as wearOnPicture (src/art/fighterArt.js), for the contact sheet ----------

def recolor(img, mask, colors):
    """colors: {mask value: (r, g, b)}. Keeps each pixel's light and dark compared to its region's average."""
    px = np.array(img).astype(np.float32)
    m = np.array(mask)
    for value, color in colors.items():
        sel = m == value
        if not sel.any():
            continue
        lm = lum(px[..., 0], px[..., 1], px[..., 2])
        f = np.clip(0.35 + 0.65 * lm[sel] / max(1, lm[sel].mean()), 0, 1.6)
        for c in range(3):
            px[..., c][sel] = np.clip(color[c] * f, 0, 255)
    return Image.fromarray(px.astype(np.uint8), "RGBA")


def places(slot, show, s):
    """Pasted pieces: [(frame, middle x, middle y, box width, box height)]"""
    fx, fy, fw, fh = s["face"]
    bx, by, bw = s["belt"]
    if slot == "weapon":
        return [(("l", "r")[i % 2], x, y, z * 1.35, z * 1.35) for i, (x, y, z) in enumerate(s["fists"])]
    if slot == "amulet":
        return [(None, fx, fy + fh + fw * 0.2, fw * 0.36, fw * 0.36)]
    if show == "band":
        return [(None, fx, fy + fh * 0.1, fw * 1.15, fh * 0.3)]
    if show == "scouter":
        return [(None, fx + fw * 0.2, fy + fh * 0.42, fw * 0.62, fh * 0.36)]
    if show == "coin":
        return [(None, bx + bw * 0.32, by, fw * 0.32, fw * 0.32)]
    return []


SLOTS = {"weapon": ["trainingGloves", "powerBracers", "dragonGauntlets", "titanFists", "thunderGauntlets", "godFists"],
         "armor": ["clothVest", "battleArmor", "divineArmor", "titanPlate", "phoenixArmor", "celestialArmor"],
         "pants": ["trainingPants", "weightedPants", "dragonPants", "titanLeggings", "stormPants", "celestialPants"],
         "boots": ["sandals", "windBoots", "cloudBoots", "thunderBoots", "phoenixBoots", "lightBoots"],
         "amulet": ["kiCharm", "spiritPendant", "dragonPearl", "titanSeal", "phoenixHeart", "godStar"]}
# Item colors from src/data/shop.js (tier 1 ... 6)
COLORS = {"armor": [0xc98a3a, 0x8c8f99, 0x5ad8ff, 0xd9772b, 0xff4b3d, 0xe8f4ff],
          "pants": [0x3a6ad8, 0x6a4a9a, 0xe0661a, 0x8a5a2a, 0x2a8ad8, 0xf2f4f8],
          "boots": [0xc98a3a, 0x8c8f99, 0xffffff, 0xffd93b, 0xff5a3d, 0x9ffff0]}
SHOW = {"scouter": "scouter", "eagleScouter": "scouter", "healingBand": "band", "phoenixBand": "band",
        "luckyCoin": "coin", "dragonCoin": "coin"}


def rgb(c):
    return ((c >> 16) & 255, (c >> 8) & 255, c & 255)


def dress(key, spots, tier, accessory):
    img = Image.open(os.path.join(ART, key + ".png")).convert("RGBA")
    mask = Image.open(os.path.join(MASKS, key + ".png"))
    img = recolor(img, mask, {TORSO: rgb(COLORS["armor"][tier]), LEGS: rgb(COLORS["pants"][tier]),
                              BOOTS: rgb(COLORS["boots"][tier])})
    for slot, gid in [("amulet", SLOTS["amulet"][tier]), ("weapon", SLOTS["weapon"][tier]), ("accessory", accessory)]:
        g = Image.open(os.path.join(ART, "gear", gid + ".png")).convert("RGBA")
        for frame, x, y, w, h in places(slot, SHOW.get(gid), spots):
            piece = g
            if frame:
                half = g.width // 2
                piece = g.crop((0, 0, half, g.height) if frame == "l" else (half, 0, g.width, g.height))
            k = min(w / piece.width, h / piece.height)
            piece = piece.resize((max(1, round(piece.width * k)), max(1, round(piece.height * k))), Image.LANCZOS)
            img.alpha_composite(piece, (max(0, round(x - piece.width / 2)), max(0, round(y - piece.height / 2))))
    return img


def sheet(out, path):
    cell, cols = 190, 12
    keys = list(out)
    big = Image.new("RGB", (cols * cell, ((len(keys) * 2 + cols - 1) // cols) * cell), (70, 110, 70))
    for i, k in enumerate(keys):
        for j, (tier, acc) in enumerate([(5, ["phoenixBand", "eagleScouter", "dragonCoin"][i % 3]), (1, ["healingBand", "scouter", "luckyCoin"][i % 3])]):
            d = dress(k, out[k], tier, acc)
            d.thumbnail((cell, cell))
            n = i * 2 + j
            big.paste(d, ((n % cols) * cell, (n // cols) * cell), d)
    big.save(path)


def main():
    out = dict(find(p) for p in sorted(glob.glob(os.path.join(ART, "hero_*.png"))))
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("// Where the small gear pieces sit on each hero picture, in the picture's pixels (made by tools/hero_anchors.py).\n")
        f.write("// face [middle x, top y, width, height], belt [middle x, y, width], fists [[x, y, size], ...].\n")
        f.write("// art/hero_masks/<key>.png marks the gi top, gi pants and boots, which armor, pants and boots recolor.\n")
        f.write("export const HERO_ANCHORS = {\n")
        for k, v in out.items():
            f.write(f"  {k}: {json.dumps(v, separators=(', ', ': '))},\n")
        f.write("};\n")
    print(len(out), "pictures")
    if "--sheet" in sys.argv:
        sheet(out, sys.argv[sys.argv.index("--sheet") + 1])


if __name__ == "__main__":
    main()
