// Placeholder fighter drawing, in a 64x64 box. Used for the in-game textures
// and, scaled up as vector graphics, for big portraits on the menu screens.
// Extra look parts:
// - rank (fighter upgrades inside a form): 2 = headband and glowing wristbands, 3 = also a cape.
//   `trim` is their color.
// - gear (what a hero wears, see gearLook): gloves, plate, pants, bootsColor, pendant, scouter, band, coin.
//   `tiers` (slot -> gear tier) adds gold trim, gems and wings to Legendary gear and better.
import { GEAR } from '../data/shop.js';
import { FORMS } from '../data/fighters.js';
import { ART_FILES, artSize } from '../data/art.js';
import { HERO_ANCHORS } from '../data/heroAnchors.js';

const O = 0x0d0d12;
export const pts = (arr) => arr.map(([x, y]) => ({ x, y }));

// Makes a color darker (f < 1) or lighter (f > 1)
export function shade(color, f) {
  const r = Math.min(255, Math.round(((color >> 16) & 255) * f));
  const g = Math.min(255, Math.round(((color >> 8) & 255) * f));
  const b = Math.min(255, Math.round((color & 255) * f));
  return (r << 16) | (g << 8) | b;
}

export function drawFighterArt(g, look, part = 'all') {
  if (part !== 'head') drawBody(g, look);
  if (part !== 'body') drawHead(g, look);
}

// Everything below the head (and what is behind it: long hair, cape, shadow)
function drawBody(g, look) {
  const tiers = look.tiers ?? {};
  g.fillStyle(0x000000, 0.28).fillEllipse(32, 60.5, 36, 8);
  g.lineStyle(2.4, O);
  // Super Form 3: very long spiky hair down the back, behind the body
  if (look.longHair) {
    const back = pts([[20, 16], [6, 28], [11, 31], [3, 42], [10, 42], [5, 55], [14, 49], [32, 52], [50, 49], [59, 55], [54, 42], [61, 42], [53, 31], [58, 28], [44, 16]]);
    g.fillStyle(look.hair).fillPoints(back, true);
    g.fillStyle(shade(look.hair, 0.78)).fillPoints(pts([[44, 16], [58, 28], [53, 31], [61, 42], [54, 42], [59, 55], [50, 49], [44, 50]]), true);
    g.strokePoints(back, true);
  }
  // Top fighter upgrade: a cape behind the body, with folds
  if (look.rank >= 3) {
    const cape = pts([[19, 31], [45, 31], [57, 61], [32, 57], [7, 61]]);
    g.fillStyle(shade(look.trim, 0.8)).fillPoints(cape, true);
    g.fillStyle(shade(look.trim, 0.58)).fillPoints(pts([[45, 31], [57, 61], [44, 59], [40, 36]]), true);
    g.fillStyle(shade(look.trim, 1.05)).fillPoints(pts([[19, 31], [24, 33], [15, 59], [7, 61]]), true);
    g.strokePoints(cape, true);
  }
  // Legs (gi pants, or the hero's Pants gear) and boots
  const legs = look.pants ?? look.gi;
  g.fillStyle(legs);
  g.fillRoundedRect(22.5, 46, 9, 11, 2).strokeRoundedRect(22.5, 46, 9, 11, 2);
  g.fillRoundedRect(32.5, 46, 9, 11, 2).strokeRoundedRect(32.5, 46, 9, 11, 2);
  g.fillStyle(shade(legs, 0.72)).fillRect(28.5, 48, 2, 8).fillRect(38.5, 48, 2, 8);
  g.fillStyle(shade(legs, 1.3), 0.8).fillRect(24, 48, 1.8, 7).fillRect(34, 48, 1.8, 7);
  // Strong pants have a gold stripe
  if (tiers.pants >= 4) g.fillStyle(0xffd93b).fillRect(23.5, 51, 7, 1.6).fillRect(33.5, 51, 7, 1.6);
  const boots = look.bootsColor ?? look.boots;
  g.fillStyle(boots);
  g.fillRoundedRect(21, 54, 11, 6.5, 2.5).strokeRoundedRect(21, 54, 11, 6.5, 2.5);
  g.fillRoundedRect(32, 54, 11, 6.5, 2.5).strokeRoundedRect(32, 54, 11, 6.5, 2.5);
  g.fillStyle(shade(boots, 0.6)).fillRect(22, 58.6, 9, 1.4).fillRect(33, 58.6, 9, 1.4);
  g.fillStyle(shade(boots, 1.5), 0.7).fillRect(23, 55.2, 4, 1.4).fillRect(34, 55.2, 4, 1.4);
  // Strong boots have little wings
  if (tiers.boots >= 4) {
    g.fillStyle(0xffffff).fillTriangle(21, 55, 15, 51, 21, 58).fillTriangle(43, 55, 49, 51, 43, 58);
    g.lineStyle(1.4, O).strokeTriangle(21, 55, 15, 51, 21, 58).strokeTriangle(43, 55, 49, 51, 43, 58);
    g.lineStyle(2.4, O);
  }
  // Arms (sleeves), wristbands and fists
  g.fillStyle(look.gi);
  g.fillRoundedRect(13.5, 31.5, 8.5, 11, 3.5).strokeRoundedRect(13.5, 31.5, 8.5, 11, 3.5);
  g.fillRoundedRect(42, 31.5, 8.5, 11, 3.5).strokeRoundedRect(42, 31.5, 8.5, 11, 3.5);
  g.fillStyle(shade(look.gi, 0.75)).fillRect(46.5, 33.5, 2.6, 6.5);
  g.fillStyle(shade(look.gi, 1.3), 0.8).fillRect(15, 33.5, 2, 5);
  g.fillStyle(look.rank >= 2 ? look.trim : look.belt).fillRect(14, 40, 7.6, 3).fillRect(42.4, 40, 7.6, 3);
  // Fists, or gloves when the hero wears a weapon
  const hand = look.gloves ?? look.skin;
  const fist = look.gloves ? 5.6 : 4.6;
  g.fillStyle(hand);
  g.fillCircle(17, 45.5, fist).strokeCircle(17, 45.5, fist);
  g.fillCircle(47, 45.5, fist).strokeCircle(47, 45.5, fist);
  g.fillStyle(shade(hand, 0.75), 0.9).fillEllipse(18.2, 47.4, fist * 1.1, fist * 0.6).fillEllipse(48.2, 47.4, fist * 1.1, fist * 0.6);
  g.fillStyle(shade(hand, 1.5), 0.75).fillCircle(15.4, 43.8, 1.7).fillCircle(45.4, 43.8, 1.7);
  // Strong gloves have shining studs
  if (tiers.weapon >= 4) {
    g.fillStyle(0xffffff).fillCircle(17, 45.5, 1.7).fillCircle(47, 45.5, 1.7);
    g.lineStyle(1.2, O).strokeCircle(17, 45.5, 1.7).strokeCircle(47, 45.5, 1.7);
    g.lineStyle(2.4, O);
  }
  // Neck
  g.fillStyle(shade(look.skin, 0.8)).fillRect(29, 29, 6, 4);
  // Body (gi) with an undershirt, shading and belt
  g.fillStyle(look.gi).fillRoundedRect(20, 31, 24, 18, 5).strokeRoundedRect(20, 31, 24, 18, 5);
  g.fillStyle(shade(look.gi, 0.74)).fillRoundedRect(36, 33, 7, 12, 3);
  g.fillStyle(shade(look.gi, 1.28)).fillRoundedRect(22, 33.5, 3, 9, 1.5);
  g.fillStyle(look.belt).fillPoints(pts([[26.5, 31.5], [37.5, 31.5], [32, 40]]), true);
  g.lineStyle(1.6, O).lineBetween(26.5, 31.5, 32, 40).lineBetween(37.5, 31.5, 32, 40);
  g.lineStyle(2.4, O);
  g.fillStyle(look.belt).fillRect(20, 44, 24, 4).strokeRect(20, 44, 24, 4);
  g.fillStyle(shade(look.belt, 1.35), 0.8).fillRect(21.5, 44.8, 21, 1.1);
  // Belt knot and its tail
  g.fillStyle(look.belt).fillPoints(pts([[29, 48], [27, 54], [30.5, 53], [31.5, 48]]), true);
  g.fillRoundedRect(28.5, 43.4, 5.4, 5.2, 1.5).strokeRoundedRect(28.5, 43.4, 5.4, 5.2, 1.5);
  // Armor: a chest plate with shoulder pads
  if (look.plate) {
    g.fillStyle(look.plate).fillRoundedRect(22, 32, 20, 12, 4).strokeRoundedRect(22, 32, 20, 12, 4);
    g.fillStyle(shade(look.plate, 0.72)).fillRoundedRect(35, 34, 6, 9, 2);
    g.fillStyle(shade(look.plate, 1.4)).fillRoundedRect(24.5, 34, 4, 6, 1.5);
    g.fillStyle(look.plate).fillEllipse(19, 33, 12, 7.5).strokeEllipse(19, 33, 12, 7.5);
    g.fillEllipse(45, 33, 12, 7.5).strokeEllipse(45, 33, 12, 7.5);
    g.fillStyle(shade(look.plate, 1.45), 0.8).fillEllipse(17.5, 31.8, 5, 2).fillEllipse(43.5, 31.8, 5, 2);
    // Strong armor: gold trim and a gem in the middle
    if (tiers.armor >= 4) {
      g.lineStyle(1.4, 0xffd93b).lineBetween(23.5, 42.6, 40.5, 42.6);
      g.fillStyle(0xffd93b).fillCircle(32, 37.5, 3.1).lineStyle(1.3, O).strokeCircle(32, 37.5, 3.1);
      g.fillStyle(tiers.armor >= 6 ? 0x5ad8ff : 0xff3b5a).fillCircle(32, 37.5, 1.9);
      g.fillStyle(0xffffff, 0.8).fillCircle(31.4, 36.9, 0.7);
      g.lineStyle(2.4, O);
    }
  }
  // Amulet: a stone on a cord (strong ones are bigger, in a gold frame)
  if (look.pendant) {
    const big = tiers.amulet >= 4;
    const py = big ? 40 : 39.5;
    g.lineStyle(1.5, O).lineBetween(28, 32, 32, 38).lineBetween(36, 32, 32, 38);
    if (big) g.fillStyle(0xffd93b).fillCircle(32, py, 4.4).strokeCircle(32, py, 4.4);
    g.fillStyle(look.pendant).fillCircle(32, py, 3).lineStyle(1.5, O).strokeCircle(32, py, 3);
    g.fillStyle(0xffffff, 0.8).fillCircle(31, py - 1, 1);
    g.lineStyle(2.4, O);
  }
  // Lucky coin on the belt
  if (look.coin) {
    g.fillStyle(0xffd93b).fillCircle(38, 46.5, 3.4).lineStyle(1.5, O).strokeCircle(38, 46.5, 3.4);
    g.fillStyle(look.coin === true ? 0xffe98a : look.coin).fillCircle(38, 46.5, 1.8);
    g.lineStyle(2.4, O);
  }
}

// The head, hair and what is worn on it, and the Super Form sparks
function drawHead(g, look) {
  const tiers = look.tiers ?? {};
  g.lineStyle(2.4, O);
  // Head and ear, with a soft shade under the hair and on the chin
  g.fillStyle(look.skin);
  g.fillCircle(42.2, 25, 2.8).strokeCircle(42.2, 25, 2.8);
  g.fillCircle(32, 23.5, 10.5).strokeCircle(32, 23.5, 10.5);
  g.fillStyle(shade(look.skin, 0.82), 0.75).fillEllipse(34, 31.2, 12, 3.4);
  g.fillStyle(shade(look.skin, 0.86), 0.7).fillRect(24, 17, 16, 3);
  g.fillStyle(0xff8a7a, 0.35).fillEllipse(25, 28, 3.6, 2).fillEllipse(38.6, 28, 3.6, 2);
  // Big anime eyes: white, a dark iris with a shine, and strong brows
  g.fillStyle(0xffffff).fillEllipse(27.6, 24.3, 5.6, 5.8).fillEllipse(36.2, 24.3, 5.6, 5.8);
  g.fillStyle(look.eye ?? 0x1a1a22).fillEllipse(27.7, 24.7, 3.7, 4.7).fillEllipse(36.1, 24.7, 3.7, 4.7);
  g.fillStyle(0xffffff).fillCircle(26.9, 23.5, 1).fillCircle(35.3, 23.5, 1);
  g.fillStyle(0xffffff, 0.75).fillCircle(28.5, 26, 0.5).fillCircle(36.9, 26, 0.5);
  g.lineStyle(1.2, O).strokeEllipse(27.6, 24.3, 5.6, 5.8).strokeEllipse(36.2, 24.3, 5.6, 5.8);
  g.lineStyle(2.2, O);
  g.lineBetween(24.2, 19.6, 30.4, 21.6);
  g.lineBetween(33.6, 21.6, 39.8, 19.6);
  // A small confident smile
  g.lineStyle(1.2, O);
  g.beginPath().arc(32.1, 27.9, 2.5, Math.PI * 0.2, Math.PI * 0.8).strokePath();
  // Spiky hair: a darker side, a shine, and bangs over the forehead
  g.lineStyle(2.4, O);
  const hair = pts([[21, 26], [13, 17], [21, 17], [17, 6], [27, 13], [32, 0], [37, 12], [47, 6], [43, 17], [51, 17], [43, 26], [39, 18], [32, 15], [25, 18]]);
  g.fillStyle(look.hair).fillPoints(hair, true);
  g.fillStyle(shade(look.hair, 0.72)).fillPoints(pts([[37, 12], [47, 6], [43, 17], [51, 17], [43, 26], [39, 18], [35, 15.5]]), true);
  g.strokePoints(hair, true);
  g.fillStyle(shade(look.hair, 1.7), 0.6).fillPoints(pts([[27, 12], [32, 3], [34, 11], [30, 14]]), true);
  g.fillStyle(shade(look.hair, 1.7), 0.45).fillPoints(pts([[18.5, 8.5], [24, 13], [20.5, 15.5]]), true);
  // Headband (fighter upgrade, or the hero's healing band) with its tails
  const band = look.band ?? (look.rank >= 2 ? look.trim : null);
  if (band) {
    const tail = pts([[42, 16], [52, 18.5], [50, 23], [42, 19.5]]);
    g.fillStyle(shade(band, 0.8)).fillPoints(tail, true).strokePoints(tail, true);
    g.fillStyle(band).fillRect(22, 15.6, 20, 3.8).strokeRect(22, 15.6, 20, 3.8);
    g.fillStyle(shade(band, 1.5), 0.7).fillRect(23.2, 16.3, 17.6, 1);
    // A strong band has a gold stud
    if (look.band && tiers.accessory >= 4) {
      g.fillStyle(0xffd93b).fillCircle(32, 17.5, 2).lineStyle(1.2, O).strokeCircle(32, 17.5, 2);
      g.lineStyle(2.4, O);
    }
  }
  g.lineStyle(1.6, O);
  for (const b of [pts([[24.5, 16.5], [27.2, 21.8], [29.8, 16]]), pts([[30.4, 15.4], [33.4, 20.6], [36.4, 15.6]])]) {
    g.fillStyle(look.hair).fillPoints(b, true).strokePoints(b, false);
  }
  g.lineStyle(2.4, O);
  // Scouter lens over one eye, with its ear piece
  if (look.scouter) {
    const lens = look.scouter === true ? 0x5be35b : look.scouter;
    g.fillStyle(lens, 0.55).fillRoundedRect(32.6, 20.6, 8.4, 6.6, 1.5);
    g.lineStyle(1.5, O).strokeRoundedRect(32.6, 20.6, 8.4, 6.6, 1.5);
    g.fillStyle(0xffffff, 0.7).fillRect(34, 21.6, 2.4, 1.2);
    g.fillStyle(0x8c8f99).fillRoundedRect(41, 21, 3.4, 6.4, 1).strokeRoundedRect(41, 21, 3.4, 6.4, 1);
    g.lineStyle(2.4, O);
  }
  // Super Form 2 and 3: little lightning sparks around the fighter
  if (look.sparks) {
    for (const z of [[[8, 22], [12, 27], [7, 31], [11, 36]], [[56, 18], [52, 24], [57, 28], [53, 33]], [[50, 44], [55, 48], [51, 52]]]) {
      g.lineStyle(3.4, 0x5ad8ff, 0.35).strokePoints(pts(z), false);
      g.lineStyle(1.6, 0xeafcff, 1).strokePoints(pts(z), false);
    }
  }
}

// A big, crisp fighter portrait centered on (x, y).
// `key` (a texture key like 'hero_zenko_0') uses the AI picture when one has been added.
// A look from gearLook wears the gear pictures (art/gear) on top of the drawn fighter.
export function fighterPortrait(scene, x, y, look, scale = 3, key = null) {
  if (key && scene.textures.exists(`art_${key}`)) {
    // Fits the picture in the square without stretching it (the pictures are not all square).
    // A hero picture wears the hero's gear (look.worn).
    const worn = (look.worn ?? []).filter((g) => GEAR[g]).sort();
    let tex = `art_${key}`;
    if (worn.length && HERO_ANCHORS[key]) {
      tex = `art_${key}~${worn.join('~')}`;
      if (!scene.textures.exists(tex)) scene.textures.addCanvas(tex, wearOnPicture(scene, key, worn));
    }
    const img = scene.add.image(x, y, tex);
    return img.setScale((64 * scale) / Math.max(img.width, img.height));
  }
  const pieces = gearPieces(scene, look.worn);
  if (!pieces.length) {
    const g = scene.add.graphics();
    drawFighterArt(g, look);
    g.setScale(scale).setPosition(x - 32 * scale, y - 32 * scale);
    return g;
  }
  // Body, the gear on the body, head, the gear on the head - in a container that moves as one picture
  const box = scene.add.container(x, y);
  const plain = undress(look, pieces);
  for (const part of ['body', 'head']) {
    const g = scene.add.graphics();
    drawFighterArt(g, plain, part);
    box.add(g.setScale(scale).setPosition(-32 * scale, -32 * scale));
    for (const p of pieces.filter((q) => q.part === part)) {
      const img = scene.add.image((p.x - 32) * scale, (p.y - 32) * scale, p.key, p.frame).setScale(p.s * scale);
      box.add(img);
    }
  }
  return box;
}

// Where each gear picture is worn, in the 64 x 64 fighter box: [middle x, middle y, width, height] of the
// space it fills (the picture keeps its shape). Gloves and boots are a pair in one picture: `pair` puts its
// left half on the left hand / foot and its right half on the right one.
const WORN = {
  weapon: { part: 'body', pair: [[17, 45.5], [47, 45.5]], w: 14, h: 13 },
  armor: { part: 'body', at: [32, 39.5], w: 32, h: 21 },
  pants: { part: 'body', at: [32, 51], w: 23, h: 14 },
  boots: { part: 'body', pair: [[26.5, 57.2], [37.5, 57.2]], w: 12.5, h: 9 },
  amulet: { part: 'body', at: [32, 38.5], w: 9, h: 10 },
  coin: { part: 'body', at: [38, 46.5], w: 8, h: 8 },
  scouter: { part: 'head', at: [37.5, 23.6], w: 17, h: 9 },
  band: { part: 'head', at: [32, 16.8], w: 24, h: 8 },
};
// Gear whose picture shows one piece, not a pair: it is worn on both hands / feet
const ONE_PIECE = ['windBoots'];

// The gear pictures to wear, for worn item ids that have a picture loaded (BootScene loads art/gear).
// Each piece: { key, frame, part, x, y, s } (s = scale for a 64 x 64 fighter).
export function gearPieces(scene, worn = []) {
  const out = [];
  for (const id of worn) {
    const item = GEAR[id];
    const key = `gear_${id}`;
    if (!item || !scene.textures.exists(key)) continue;
    const place = WORN[item.slot === 'accessory' ? item.show : item.slot];
    const tex = scene.textures.get(key);
    const img = tex.getSourceImage();
    if (place.pair && ONE_PIECE.includes(id)) {
      const s = Math.min(place.w / img.width, place.h / img.height);
      place.pair.forEach(([x, y]) => out.push({ key, frame: undefined, part: place.part, x, y, s, slot: item.slot }));
    } else if (place.pair) {
      // One frame per half of the pair
      const half = Math.floor(img.width / 2);
      if (!tex.has('l')) tex.add('l', 0, 0, 0, half, img.height);
      if (!tex.has('r')) tex.add('r', 0, half, 0, img.width - half, img.height);
      const s = Math.min(place.w / half, place.h / img.height);
      place.pair.forEach(([x, y], i) => out.push({ key, frame: i ? 'r' : 'l', part: place.part, x, y, s, slot: item.slot }));
    } else {
      const s = Math.min(place.w / img.width, place.h / img.height);
      out.push({ key, frame: undefined, part: place.part, x: place.at[0], y: place.at[1], s, slot: item.slot });
    }
  }
  return out;
}

// The look without the drawn version of the gear that is worn as a picture (the picture goes on top)
function undress(look, pieces) {
  const plain = { ...look, tiers: { ...look.tiers } };
  for (const p of pieces) {
    delete plain.tiers[p.slot];
    if (p.slot === 'armor') plain.plate = null;
    if (p.slot === 'amulet') plain.pendant = null;
    if (p.slot === 'accessory') Object.assign(plain, { scouter: null, band: null, coin: null });
  }
  return plain;
}

// What a hero's worn gear (slot -> item id) adds to its look. Each piece shows in its item's color.
// `worn` lists the item ids, so the gear pictures can be worn too (see gearPieces).
export function gearLook(gear = {}) {
  const look = { tiers: {}, worn: Object.values(gear).filter((id) => GEAR[id]) };
  for (const id of Object.values(gear)) {
    const item = GEAR[id];
    if (!item) continue;
    look.tiers[item.slot] = item.tier;
    if (item.slot === 'weapon') look.gloves = item.color;
    else if (item.slot === 'armor') look.plate = item.color;
    else if (item.slot === 'pants') look.pants = item.color;
    else if (item.slot === 'boots') look.bootsColor = item.color;
    else if (item.slot === 'amulet') look.pendant = item.color;
    else if (item.show === 'scouter') look.scouter = item.color;
    else if (item.show === 'coin') look.coin = item.color;
    else look.band = item.color;
  }
  return look;
}

// A look in a form: hair color, long hair and sparks
export function formLook(look, form) {
  const f = FORMS[form];
  return { ...look, hair: f.hair ?? look.hair, longHair: f.longHair, sparks: f.sparks };
}

// A hero picture (full size) wearing gear, as a canvas. Armor, pants and boots recolor the gi top, the gi pants
// and the boots (art/hero_masks, made by tools/hero_anchors.py) in the item's color, keeping the picture's shading.
// Gloves, the amulet and the band / scouter / coin are pasted on at the spots in src/data/heroAnchors.js.
// tools/hero_anchors.py --sheet uses the same rules.
export function wearOnPicture(scene, key, worn) {
  const src = scene.textures.get(`art_${key}`).getSourceImage();
  const canvas = document.createElement('canvas');
  canvas.width = src.width;
  canvas.height = src.height;
  const c = canvas.getContext('2d');
  c.drawImage(src, 0, 0);
  const items = worn.map((id) => ({ id, ...GEAR[id] }));
  const color = (slot) => items.find((it) => it.slot === slot)?.color;
  const colors = { 80: color('armor'), 160: color('pants'), 240: color('boots') };
  if (scene.textures.exists(`mask_${key}`) && Object.values(colors).some((v) => v !== undefined)) {
    recolor(c, scene.textures.get(`mask_${key}`).getSourceImage(), colors);
  }
  const s = HERO_ANCHORS[key];
  const [fx, fy, fw, fh] = s.face;
  const [bx, by, bw] = s.belt;
  for (const it of items) {
    if (!scene.textures.exists(`gear_${it.id}`)) continue;
    const img = scene.textures.get(`gear_${it.id}`).getSourceImage();
    let spots = [];
    if (it.slot === 'weapon') spots = s.fists.map(([x, y, z], i) => [i % 2 ? 'r' : 'l', x, y, z * 1.35, z * 1.35]);
    else if (it.slot === 'amulet') spots = [[null, fx, fy + fh + fw * 0.2, fw * 0.36, fw * 0.36]];
    else if (it.show === 'band') spots = [[null, fx, fy + fh * 0.1, fw * 1.15, fh * 0.3]];
    else if (it.show === 'scouter') spots = [[null, fx + fw * 0.2, fy + fh * 0.42, fw * 0.62, fh * 0.36]];
    else if (it.show === 'coin') spots = [[null, bx + bw * 0.32, by, fw * 0.32, fw * 0.32]];
    for (const [half, x, y, w, h] of spots) {
      const sw = half ? Math.floor(img.width / 2) : img.width;
      const sx = half === 'r' ? img.width - sw : 0;
      const k = Math.min(w / sw, h / img.height);
      const dw = sw * k;
      const dh = img.height * k;
      c.drawImage(img, sx, 0, sw, img.height, x - dw / 2, y - dh / 2, dw, dh);
    }
  }
  return canvas;
}

// Paints each marked part of the picture in its color: a pixel lighter or darker than its part's average stays
// that much lighter or darker. Black outlines are not marked, so they stay.
function recolor(c, maskImg, colors) {
  const { width, height } = c.canvas;
  const data = c.getImageData(0, 0, width, height);
  const m = document.createElement('canvas');
  m.width = width;
  m.height = height;
  const mc = m.getContext('2d');
  mc.drawImage(maskImg, 0, 0);
  const mask = mc.getImageData(0, 0, width, height).data;
  const px = data.data;
  const lum = (i) => 0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2];
  const sum = {};
  const count = {};
  for (let i = 0; i < px.length; i += 4) {
    const v = mask[i];
    if (colors[v] === undefined) continue;
    sum[v] = (sum[v] ?? 0) + lum(i);
    count[v] = (count[v] ?? 0) + 1;
  }
  for (let i = 0; i < px.length; i += 4) {
    const v = mask[i];
    const col = colors[v];
    if (col === undefined) continue;
    const f = Math.min(1.6, Math.max(0, 0.35 + (0.65 * lum(i)) / Math.max(1, sum[v] / count[v])));
    px[i] = Math.min(255, ((col >> 16) & 255) * f);
    px[i + 1] = Math.min(255, ((col >> 8) & 255) * f);
    px[i + 2] = Math.min(255, (col & 255) * f);
  }
  c.putImageData(data, 0, 0);
}

// Makes the game texture `key` (the size the battle uses, with a dark outline) from a full-size picture.
// `ref` is the fighter's base picture (kaito_0): every picture of a fighter is shrunk like it, so the
// character keeps its size and a stretched-out arm or tall hair may stick out of the square.
export function fitArt(scene, key, img, ref = img, size = artSize(key)) {
  const scale = Math.min(size / ref.width, size / ref.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const cw = Math.max(size, Math.ceil(w));
  // Taller than the square: room is added above and below alike, so the feet stay where they were
  const over = Math.max(0, Math.ceil(h - size));
  const ch = size + over * 2;
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const canvas = scene.textures.createCanvas(key, cw, ch);
  const c = canvas.context;
  c.imageSmoothingQuality = 'high';
  const x = (cw - w) / 2;
  const y = over + size - h;
  // A dark outline around the picture, so it stands out on the map like the drawn art
  const shape = document.createElement('canvas');
  shape.width = cw;
  shape.height = ch;
  const sc = shape.getContext('2d');
  sc.imageSmoothingQuality = 'high';
  sc.drawImage(img, x, y, w, h);
  sc.globalCompositeOperation = 'source-in';
  sc.fillStyle = '#0d0d12';
  sc.fillRect(0, 0, cw, ch);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) c.drawImage(shape, dx, dy);
  c.drawImage(img, x, y, w, h);
  canvas.refresh();
}

// The texture of a hero in a form and pose ('', '_attack', '_run'), wearing its gear. Made the first time it
// is needed. A hero picture (art/hero_zenko_2_run.png) wears the gear with wearOnPicture; a drawn hero gets
// the gear drawn on. With no gear it is the plain texture ('hero_zenko_2_run'). A pose with no picture is
// the standing one.
export function heroTexture(scene, id, form, look, gear = {}, pose = '') {
  let base = `hero_${id}_${form}`;
  if (pose && scene.textures.exists(`${base}${pose}`)) base += pose;
  const worn = Object.values(gear).filter((g) => GEAR[g]).sort();
  if (!worn.length) return base;
  const key = `${base}~${worn.join('~')}`;
  if (ART_FILES.includes(base)) {
    if (!HERO_ANCHORS[base] || !scene.textures.exists(`art_${base}`)) return base;
    if (!scene.textures.exists(key)) {
      fitArt(scene, key, wearOnPicture(scene, base, worn), scene.textures.get(`art_hero_${id}_0`).getSourceImage(), artSize(base));
    }
    return key;
  }
  if (!scene.textures.exists(key)) {
    const full = { ...formLook(look, form), ...gearLook(gear) };
    const pieces = gearPieces(scene, full.worn);
    if (!pieces.length) {
      const g = scene.make.graphics({ add: false });
      drawFighterArt(g, full);
      g.generateTexture(key, 64, 64);
      g.destroy();
      return key;
    }
    // Drawn body, gear pictures on it, drawn head, gear pictures on the head
    const canvas = scene.textures.createCanvas(key, 64, 64);
    const c = canvas.context;
    c.imageSmoothingQuality = 'high';
    const plain = undress(full, pieces);
    for (const part of ['body', 'head']) {
      const g = scene.make.graphics({ add: false });
      drawFighterArt(g, plain, part);
      g.generateTexture('~part', 64, 64);
      g.destroy();
      c.drawImage(scene.textures.get('~part').getSourceImage(), 0, 0);
      scene.textures.remove('~part');
      for (const p of pieces.filter((q) => q.part === part)) {
        const f = scene.textures.getFrame(p.key, p.frame);
        const w = f.cutWidth * p.s;
        const h = f.cutHeight * p.s;
        c.drawImage(f.source.image, f.cutX, f.cutY, f.cutWidth, f.cutHeight, p.x - w / 2, p.y - h / 2, w, h);
      }
    }
    canvas.refresh();
  }
  return key;
}
