"""Cuts the user's hero sheets (art_sources/sheets_2026-11-17) into art/hero_<id>_<form>[_attack|_run].png
with a see-through background, the same size as the fighter pictures (369 x 395, feet 13 px from the bottom).

Every picture of a form is scaled like that form's standing picture from the same sheet, so the standing
figure is always 382 px tall and the attack/run poses keep their size next to it.

    python tools/cut_heroes.py            (cuts everything)
    python tools/cut_heroes.py goran      (one hero)
"""
import colorsys
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEETS = os.path.join(PROJECT, "art_sources", "sheets_2026-11-17")
OUT = os.path.join(PROJECT, "art")
HEIGHT = 382  # the standing figure
CANVAS = (369, 395)
FEET = 13


def grid(sheet, cols, rows, col, row, inset=6):
    """The box of one cell of a sheet split into equal cells"""
    w, h = Image.open(os.path.join(SHEETS, sheet)).size
    cw, ch = w / cols, h / rows
    return (round(col * cw) + inset, round(row * ch) + inset, round((col + 1) * cw) - inset, round((row + 1) * ch) - inset)


# id -> form -> {pose: (sheet, box, options)}; options: lim (how far from white is background),
# keep (the share of the biggest part that other parts need to stay), drop_yellow (gold hair poking in from above)
def zenko_like(sheet):
    return {f: {"": (sheet, grid(sheet, 6, 3, f, 0, 2)), "_attack": (sheet, grid(sheet, 6, 3, f, 1, 2)),
                "_run": (sheet, grid(sheet, 6, 3, f, 2, 2))} for f in range(6)}


def goran():
    s = "goran_sheet.jpg"
    # The normal form's attack has gold hair: fix_goran_hair makes it brown
    return {f: {"": (s, grid(s, 6, 3, f, 0)), "_attack": (s, grid(s, 6, 3, f, 1)), "_run": (s, grid(s, 6, 3, f, 2))}
            for f in range(6)}


def sora():
    gold = "1794950784526.jpg"
    forms = "sora_forms.jpg"
    out = {
        0: {"": (forms, (60, 22, 225, 222)), "_attack": ("Sora.jpg", (80, 70, 345, 388))},
        # Super Form 3's long gold hair from the row above hangs into the left of red Sora's picture
        4: {"": (forms, (90, 491, 225, 606), {"drop_yellow": (30, 55), "solid": 9}), "_attack": (forms, (1160, 478, 1300, 606))},
        5: {"": (forms, (95, 606, 230, 752)), "_attack": (forms, (1160, 606, 1300, 752))},
    }
    for f in (1, 2, 3):
        out[f] = {"": (gold, grid(gold, 3, 3, 0, f - 1)), "_attack": (gold, grid(gold, 3, 3, 2, f - 1), {"holes": False})}
    return out


HEROES = {
    "zenko": zenko_like("zanko_walking.jpg"),
    "mira": zenko_like("mira_wlking.jpg"),
    "goran": goran(),
    "sora": sora(),
}


def cut(sheet, box, lim=38, keep=0.25, drop_yellow=False, holes=True, solid=0):
    """The figure in a box of a sheet, as an RGBA picture cropped to it (2x size)"""
    img = Image.open(os.path.join(SHEETS, sheet)).convert("RGB").crop(box)
    img = img.resize((img.width * 2, img.height * 2), Image.LANCZOS)
    rgb = np.array(img).astype(np.int32)
    d = 255 - rgb.min(axis=2)  # how far from white
    white = d <= lim
    if drop_yellow:
        # drop_yellow = (x, y) in the box: gold and its dark outline above-left of that point is background
        hsv = np.array(img.convert("HSV")).astype(np.int32)
        corner = np.zeros(white.shape, bool)
        corner[: drop_yellow[1] * 2, : drop_yellow[0] * 2] = True
        gold = (hsv[..., 0] >= 18) & (hsv[..., 0] <= 50) & (hsv[..., 1] > 50) & (hsv[..., 2] > 100)
        red = (rgb[..., 0] - rgb[..., 1] > 70)
        gold = ndimage.binary_dilation(gold & corner, iterations=3) & ~red
        white |= gold
    lab, _ = ndimage.label(white)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    # Closed-off white holes bigger than an eye (between arm and body) are background too
    pure, n = ndimage.label(d <= 12)
    if n and holes:
        sizes = ndimage.sum(np.ones_like(pure), pure, range(1, n + 1))
        big = [i + 1 for i, s in enumerate(sizes) if s > 250]
        bg |= np.isin(pure, big)
    fg = ~bg
    parts, n = ndimage.label(fg)
    sizes = ndimage.sum(np.ones_like(parts), parts, range(1, n + 1))
    keep_ids = [i + 1 for i, s in enumerate(sizes) if s > sizes.max() * keep]
    mask = np.isin(parts, keep_ids)
    if solid:
        # Only the main body: thin bits stuck to it (a strand of someone else's hair) are cut off
        body, n = ndimage.label(ndimage.binary_erosion(mask, iterations=solid))
        sizes = ndimage.sum(np.ones_like(body), body, range(1, n + 1))
        mask &= ndimage.binary_dilation(body == int(np.argmax(sizes)) + 1, iterations=solid + 2)
    a = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    out = img.convert("RGBA")
    out.putalpha(a)
    return out.crop(Image.fromarray((mask * 255).astype(np.uint8)).getbbox())


def place(fig, scale):
    """The figure scaled and stood on the canvas, its legs in the middle"""
    fig = fig.resize((max(1, round(fig.width * scale)), max(1, round(fig.height * scale))), Image.LANCZOS)
    a = fig.getchannel("A")
    legs = a.crop((0, int(fig.height * 0.7), fig.width, fig.height)).point(lambda v: 255 if v > 20 else 0).getbbox()
    mid = (legs[0] + legs[2]) / 2
    cw = max(CANVAS[0], int(2 * max(mid, fig.width - mid)) + 4)
    ch = max(CANVAS[1], fig.height + FEET)
    out = Image.new("RGBA", (cw, ch))
    out.paste(fig, (round(cw / 2 - mid), ch - FEET - fig.height), fig)
    return out


def fix_goran_hair(img):
    """Goran's normal-form attack picture has gold hair: it is made his own brown. Every yellow or pale-yellow
    pixel in the top of the picture keeps its light and dark, in brown."""
    px = np.array(img).astype(np.float32)
    r, g, b, a = px[..., 0], px[..., 1], px[..., 2], px[..., 3]
    rows = np.arange(px.shape[0])[:, None]
    hair = (a > 0) & (r > 110) & (r - b > 22) & (g - b > 8) & (r - g < 70) & (rows < px.shape[0] * 0.5)
    # Not his skin (more red than yellow)
    hair &= ~((r - g > 35) & (g - b > 15) & (g - b < 70))
    light = (0.3 * r + 0.59 * g + 0.11 * b) / 255
    for c, base in enumerate((120, 76, 42)):
        px[..., c] = np.where(hair, np.clip(base * (0.35 + light), 0, 255), px[..., c])
    return Image.fromarray(px.astype(np.uint8))


def unlightning(img, keep_right=None):
    """Takes out drawn light-blue lightning (the game draws its own): those pixels are filled in from the ones
    around them, so on the hair they become hair and outside the body see-through. `keep_right` keeps the right
    part of the picture as it is (the ki ball in the hand)."""
    im = np.array(img).astype(float)
    rgb, a = im[..., :3] / 255, im[..., 3] / 255
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mask = (b > r + 0.06) & (b >= g - 0.01) & (rgb.max(-1) > 0.7) & (a > 0.1)
    if keep_right:
        mask[:, int(mask.shape[1] * keep_right):] = False
    mask = ndimage.binary_dilation(mask, iterations=3)
    pre = np.dstack([rgb * a[..., None], a])
    known = ~mask
    pre[mask] = 0
    k = np.ones((3, 3))
    for _ in range(400):
        if known.all():
            break
        s = np.stack([ndimage.convolve(pre[..., c] * known, k, mode="constant") for c in range(4)], -1)
        n = ndimage.convolve(known.astype(float), k, mode="constant")
        grow = (~known) & (n > 0)
        pre[grow] = s[grow] / n[grow][:, None]
        known |= grow
    alpha = pre[..., 3]
    color = np.where(alpha[..., None] > 1e-3, pre[..., :3] / np.maximum(alpha[..., None], 1e-3), 0)
    alpha = np.where(mask, np.clip((alpha - 0.35) / 0.3, 0, 1), alpha)
    return Image.fromarray(np.dstack([np.clip(color, 0, 1) * 255, alpha * 255]).astype(np.uint8), "RGBA")


def save(img, name):
    img.quantize(256, Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(os.path.join(OUT, name + ".png"), optimize=True)


def main():
    only = sys.argv[1:] or list(HEROES)
    for hid in only:
        for form, poses in HEROES[hid].items():
            stand = poses[""]
            ref = cut(stand[0], stand[1], **(stand[2] if len(stand) > 2 else {}))
            scale = HEIGHT / ref.height
            for pose, spec in poses.items():
                fig = ref if pose == "" else cut(spec[0], spec[1], **(spec[2] if len(spec) > 2 else {}))
                if hid == "goran" and form == 0 and pose == "_attack":
                    fig = fix_goran_hair(fig)
                if hid in ("zenko", "mira") and form == 2:
                    fig = unlightning(fig, 0.75 if pose == "_attack" else None)
                out = place(fig, scale)
                save(out, f"hero_{hid}_{form}{pose}")
                print(f"hero_{hid}_{form}{pose}", out.size)


if __name__ == "__main__":
    main()
