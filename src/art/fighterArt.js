// Placeholder fighter drawing, in a 64x64 box. Used for the in-game textures
// and, scaled up as vector graphics, for big portraits on the menu screens.
// Extra look parts:
// - rank (fighter upgrades inside a form): 2 = headband and glowing wristbands, 3 = also a cape.
//   `trim` is their color.
// - gear (what a hero wears, see gearLook): gloves, plate, pants, bootsColor, pendant, scouter, band, coin.
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
  g.fillStyle(0x000000, 0.25).fillEllipse(32, 61, 36, 8);
  g.lineStyle(2.5, O);
  // Super Form 3: very long spiky hair down the back, behind the body
  if (look.longHair) {
    const back = pts([[20, 16], [6, 28], [11, 31], [3, 42], [10, 42], [5, 55], [14, 49], [32, 52], [50, 49], [59, 55], [54, 42], [61, 42], [53, 31], [58, 28], [44, 16]]);
    g.fillStyle(look.hair).fillPoints(back, true);
    g.strokePoints(back, true);
  }
  // Top fighter upgrade: a cape behind the body
  if (look.rank >= 3) {
    const cape = pts([[19, 31], [45, 31], [57, 61], [32, 57], [7, 61]]);
    g.fillStyle(shade(look.trim, 0.8)).fillPoints(cape, true);
    g.strokePoints(cape, true);
  }
  // Legs (gi pants, or the hero's Pants gear) and boots
  const legs = look.pants ?? look.gi;
  g.fillStyle(legs);
  g.fillRect(23, 47, 8, 10).strokeRect(23, 47, 8, 10);
  g.fillRect(33, 47, 8, 10).strokeRect(33, 47, 8, 10);
  g.fillStyle(shade(legs, 0.75)).fillRect(29, 48, 2, 8).fillRect(39, 48, 2, 8);
  if (look.pants) g.fillStyle(shade(legs, 1.4)).fillRect(24, 48, 2, 7).fillRect(34, 48, 2, 7);
  g.fillStyle(look.bootsColor ?? look.boots);
  g.fillRoundedRect(22, 54, 10, 6, 2).strokeRoundedRect(22, 54, 10, 6, 2);
  g.fillRoundedRect(32, 54, 10, 6, 2).strokeRoundedRect(32, 54, 10, 6, 2);
  // Arms (sleeves), wristbands and fists
  g.fillStyle(look.gi);
  g.fillRoundedRect(14, 32, 8, 10, 3).strokeRoundedRect(14, 32, 8, 10, 3);
  g.fillRoundedRect(42, 32, 8, 10, 3).strokeRoundedRect(42, 32, 8, 10, 3);
  g.fillStyle(look.rank >= 2 ? look.trim : look.belt).fillRect(14, 40, 8, 3).fillRect(42, 40, 8, 3);
  // Fists, or gloves when the hero wears a weapon
  g.fillStyle(look.gloves ?? look.skin);
  const fist = look.gloves ? 5.5 : 4.5;
  g.fillCircle(17, 45, fist).strokeCircle(17, 45, fist);
  g.fillCircle(47, 45, fist).strokeCircle(47, 45, fist);
  if (look.gloves) {
    g.fillStyle(shade(look.gloves, 1.4), 0.7).fillCircle(15.5, 43.5, 1.8).fillCircle(45.5, 43.5, 1.8);
  }
  // Body (gi) with an undershirt, shading and belt
  g.fillStyle(look.gi).fillRoundedRect(20, 31, 24, 18, 5).strokeRoundedRect(20, 31, 24, 18, 5);
  g.fillStyle(shade(look.gi, 0.78)).fillRoundedRect(35, 33, 8, 13, 3);
  g.fillStyle(shade(look.gi, 1.25)).fillRect(23, 34, 3, 9);
  g.fillStyle(look.belt).fillPoints(pts([[27, 31], [37, 31], [32, 39]]), true);
  g.fillStyle(look.belt).fillRect(20, 44, 24, 4).strokeRect(20, 44, 24, 4);
  g.fillRect(29, 47, 5, 5);
  // Armor: a chest plate with shoulder pads
  if (look.plate) {
    g.fillStyle(look.plate).fillRoundedRect(22, 32, 20, 12, 4).strokeRoundedRect(22, 32, 20, 12, 4);
    g.fillStyle(shade(look.plate, 1.35)).fillRect(25, 34, 4, 6);
    g.fillStyle(look.plate).fillEllipse(19, 33, 11, 7).strokeEllipse(19, 33, 11, 7);
    g.fillEllipse(45, 33, 11, 7).strokeEllipse(45, 33, 11, 7);
  }
  // Amulet: a stone on a cord
  if (look.pendant) {
    g.lineStyle(1.5, O).lineBetween(28, 32, 32, 38).lineBetween(36, 32, 32, 38);
    g.fillStyle(look.pendant).fillCircle(32, 39.5, 3).lineStyle(1.5, O).strokeCircle(32, 39.5, 3);
    g.fillStyle(0xffffff, 0.7).fillCircle(31, 38.5, 1);
    g.lineStyle(2.5, O);
  }
  // Lucky coin on the belt
  if (look.coin) {
    g.fillStyle(0xffd93b).fillCircle(37, 46, 3.2).lineStyle(1.5, O).strokeCircle(37, 46, 3.2);
    g.lineStyle(2.5, O);
  }
  // Head, ear, eyes and mouth
  g.fillStyle(look.skin);
  g.fillCircle(32, 24, 10).strokeCircle(32, 24, 10);
  g.fillCircle(42, 25, 2.5);
  g.fillStyle(0xffffff).fillEllipse(28, 24, 4.5, 4).fillEllipse(36, 24, 4.5, 4);
  g.fillStyle(O).fillCircle(28.6, 24.3, 1.3).fillCircle(35.6, 24.3, 1.3);
  g.lineStyle(2, O);
  g.lineBetween(25, 20.5, 30, 22);
  g.lineBetween(34, 22, 39, 20.5);
  g.lineBetween(30, 29, 34, 29);
  // Spiky hair with a shine
  g.lineStyle(2.5, O);
  const hair = pts([[21, 26], [13, 17], [21, 17], [17, 6], [27, 13], [32, 0], [37, 12], [47, 6], [43, 17], [51, 17], [43, 26], [39, 18], [32, 15], [25, 18]]);
  g.fillStyle(look.hair).fillPoints(hair, true);
  g.strokePoints(hair, true);
  g.fillStyle(shade(look.hair, 1.6), 0.55).fillPoints(pts([[27, 12], [32, 3], [34, 11], [30, 14]]), true);
  // Headband (fighter upgrade, or the hero's Healing Band) with its tails
  const band = look.band ?? (look.rank >= 2 ? look.trim : null);
  if (band) {
    g.fillStyle(band).fillRect(22, 16, 20, 3.5).strokeRect(22, 16, 20, 3.5);
    g.fillPoints(pts([[42, 16], [51, 19], [49, 23], [42, 19.5]]), true).strokePoints(pts([[42, 16], [51, 19], [49, 23], [42, 19.5]]), true);
  }
  // Scouter lens over one eye, with its ear piece
  if (look.scouter) {
    g.fillStyle(0x5be35b, 0.55).fillRect(33, 20.5, 8, 6);
    g.lineStyle(1.5, O).strokeRect(33, 20.5, 8, 6);
    g.fillStyle(0x8c8f99).fillRect(41, 21, 3, 6).strokeRect(41, 21, 3, 6);
    g.lineStyle(2.5, O);
  }
  // Super Form 2 and 3: little lightning sparks around the fighter
  if (look.sparks) {
    g.lineStyle(2, 0x9fe8ff, 0.95);
    for (const z of [[[8, 22], [12, 27], [7, 31], [11, 36]], [[56, 18], [52, 24], [57, 28], [53, 33]], [[50, 44], [55, 48], [51, 52]]]) {
      g.strokePoints(pts(z), false);
    }
  }
}

// A big, crisp fighter portrait centered on (x, y).
// `key` (a texture key like 'hero_zenko_0') uses the AI picture when one has been added.
export function fighterPortrait(scene, x, y, look, scale = 3, key = null) {
  if (key && scene.textures.exists(`art_${key}`)) {
    return scene.add.image(x, y, `art_${key}`).setDisplaySize(64 * scale, 64 * scale);
  }
  const g = scene.add.graphics();
  drawFighterArt(g, look);
  g.setScale(scale).setPosition(x - 32 * scale, y - 32 * scale);
  return g;
}

// What a hero's worn gear (slot -> item id) adds to its look. Each piece shows in its item's color.
export function gearLook(gear = {}) {
  const look = {};
  for (const id of Object.values(gear)) {
    const item = GEAR[id];
    if (!item) continue;
    if (item.slot === 'weapon') look.gloves = item.color;
    else if (item.slot === 'armor') look.plate = item.color;
    else if (item.slot === 'pants') look.pants = item.color;
    else if (item.slot === 'boots') look.bootsColor = item.color;
    else if (item.slot === 'amulet') look.pendant = item.color;
    else if (id === 'scouter') look.scouter = true;
    else if (id === 'luckyCoin') look.coin = true;
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
