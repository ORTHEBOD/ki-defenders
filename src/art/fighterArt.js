// Placeholder fighter drawing, in a 64x64 box. Used for the in-game textures
// and, scaled up as vector graphics, for big portraits on the menu screens.
// Extra look parts:
// - rank (fighter upgrades inside a form): 2 = headband and glowing wristbands, 3 = also a cape.
//   `trim` is their color.
// - gear (what a hero wears, see gearLook): gloves, plate, pants, bootsColor, pendant, scouter, band, coin.
//   `tiers` (slot -> gear tier) adds gold trim, gems and wings to Legendary gear and better.
import { GEAR } from '../data/shop.js';
import { FORMS } from '../data/fighters.js';
import { ART_FILES } from '../data/art.js';

const O = 0x0d0d12;
export const pts = (arr) => arr.map(([x, y]) => ({ x, y }));

// Makes a color darker (f < 1) or lighter (f > 1)
export function shade(color, f) {
  const r = Math.min(255, Math.round(((color >> 16) & 255) * f));
  const g = Math.min(255, Math.round(((color >> 8) & 255) * f));
  const b = Math.min(255, Math.round((color & 255) * f));
  return (r << 16) | (g << 8) | b;
}

export function drawFighterArt(g, look) {
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
export function fighterPortrait(scene, x, y, look, scale = 3, key = null) {
  if (key && scene.textures.exists(`art_${key}`)) {
    // Fits the picture in the square without stretching it (the pictures are not all square)
    const img = scene.add.image(x, y, `art_${key}`);
    return img.setScale((64 * scale) / Math.max(img.width, img.height));
  }
  const g = scene.add.graphics();
  drawFighterArt(g, look);
  g.setScale(scale).setPosition(x - 32 * scale, y - 32 * scale);
  return g;
}

// What a hero's worn gear (slot -> item id) adds to its look. Each piece shows in its item's color.
export function gearLook(gear = {}) {
  const look = { tiers: {} };
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

// The texture of a hero in a form, wearing its gear. Made the first time it is needed.
// With no gear (or with an AI picture for that hero) it is the plain 'hero_zenko_0' texture.
export function heroTexture(scene, id, form, look, gear = {}) {
  const base = `hero_${id}_${form}`;
  const worn = Object.values(gear).filter((g) => GEAR[g]).sort();
  if (!worn.length || ART_FILES.includes(base)) return base;
  const key = `${base}~${worn.join('~')}`;
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({ add: false });
    drawFighterArt(g, { ...formLook(look, form), ...gearLook(gear) });
    g.generateTexture(key, 64, 64);
    g.destroy();
  }
  return key;
}
