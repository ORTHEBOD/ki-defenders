// Placeholder fighter drawing, in a 64x64 box. Used for the in-game textures
// and, scaled up as vector graphics, for big portraits on the menu screens.

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
  // Legs (gi pants) and boots
  g.fillStyle(look.gi);
  g.fillRect(23, 47, 8, 10).strokeRect(23, 47, 8, 10);
  g.fillRect(33, 47, 8, 10).strokeRect(33, 47, 8, 10);
  g.fillStyle(shade(look.gi, 0.75)).fillRect(29, 48, 2, 8).fillRect(39, 48, 2, 8);
  g.fillStyle(look.boots);
  g.fillRoundedRect(22, 54, 10, 6, 2).strokeRoundedRect(22, 54, 10, 6, 2);
  g.fillRoundedRect(32, 54, 10, 6, 2).strokeRoundedRect(32, 54, 10, 6, 2);
  // Arms (sleeves), wristbands and fists
  g.fillStyle(look.gi);
  g.fillRoundedRect(14, 32, 8, 10, 3).strokeRoundedRect(14, 32, 8, 10, 3);
  g.fillRoundedRect(42, 32, 8, 10, 3).strokeRoundedRect(42, 32, 8, 10, 3);
  g.fillStyle(look.belt).fillRect(14, 40, 8, 3).fillRect(42, 40, 8, 3);
  g.fillStyle(look.skin);
  g.fillCircle(17, 45, 4.5).strokeCircle(17, 45, 4.5);
  g.fillCircle(47, 45, 4.5).strokeCircle(47, 45, 4.5);
  // Body (gi) with an undershirt, shading and belt
  g.fillStyle(look.gi).fillRoundedRect(20, 31, 24, 18, 5).strokeRoundedRect(20, 31, 24, 18, 5);
  g.fillStyle(shade(look.gi, 0.78)).fillRoundedRect(35, 33, 8, 13, 3);
  g.fillStyle(shade(look.gi, 1.25)).fillRect(23, 34, 3, 9);
  g.fillStyle(look.belt).fillPoints(pts([[27, 31], [37, 31], [32, 39]]), true);
  g.fillStyle(look.belt).fillRect(20, 44, 24, 4).strokeRect(20, 44, 24, 4);
  g.fillRect(29, 47, 5, 5);
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
