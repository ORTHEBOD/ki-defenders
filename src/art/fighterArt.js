// Placeholder fighter drawing, in a 64x64 box. Used for the in-game textures
// and, scaled up as vector graphics, for big portraits on the menu screens.

const O = 0x0d0d12;
export const pts = (arr) => arr.map(([x, y]) => ({ x, y }));

export function drawFighterArt(g, look) {
  g.fillStyle(0x000000, 0.25).fillEllipse(32, 61, 34, 8);
  g.lineStyle(2.5, O);
  // Legs and boots
  g.fillStyle(look.belt);
  g.fillRect(24, 48, 7, 10).strokeRect(24, 48, 7, 10);
  g.fillRect(33, 48, 7, 10).strokeRect(33, 48, 7, 10);
  g.fillStyle(look.boots);
  g.fillRect(23, 55, 9, 5).strokeRect(23, 55, 9, 5);
  g.fillRect(32, 55, 9, 5).strokeRect(32, 55, 9, 5);
  // Body (gi), belt and fists
  g.fillStyle(look.gi).fillRoundedRect(20, 32, 24, 18, 5).strokeRoundedRect(20, 32, 24, 18, 5);
  g.fillStyle(look.belt).fillRect(20, 45, 24, 4).strokeRect(20, 45, 24, 4);
  g.fillStyle(look.skin);
  g.fillCircle(17, 41, 4.5).strokeCircle(17, 41, 4.5);
  g.fillCircle(47, 41, 4.5).strokeCircle(47, 41, 4.5);
  // Head and eyes
  g.fillCircle(32, 24, 10).strokeCircle(32, 24, 10);
  g.lineBetween(27, 23, 30, 25);
  g.lineBetween(34, 25, 37, 23);
  // Spiky hair
  const hair = pts([[21, 26], [13, 17], [21, 17], [17, 6], [27, 13], [32, 0], [37, 12], [47, 6], [43, 17], [51, 17], [43, 26], [39, 18], [32, 15], [25, 18]]);
  g.fillStyle(look.hair).fillPoints(hair, true);
  g.strokePoints(hair, true);
}

// A big, crisp fighter portrait centered on (x, y)
export function fighterPortrait(scene, x, y, look, scale = 3) {
  const g = scene.add.graphics();
  drawFighterArt(g, look);
  g.setScale(scale).setPosition(x - 32 * scale, y - 32 * scale);
  return g;
}
