// The base (the dome the enemies attack). It looks stronger as it is upgraded:
// walls add a stone wall, then towers, then gold flags; the reactor adds a glowing Ki crystal;
// the cannon adds a turret on the roof (returned, so the battle can turn it toward enemies).
import { COLORS } from '../ui/theme.js';

export function drawBase(scene, x, y, lv = {}, depth = 9) {
  const parts = [];
  const g = scene.add.graphics().setDepth(depth);
  parts.push(g);
  const O = COLORS.outline;
  g.fillStyle(0x000000, 0.2).fillEllipse(x, y + 4, 110 + (lv.walls ? 40 : 0), 22);
  // Towers at both sides (walls 3+), with flags (walls 5)
  if (lv.walls >= 3) {
    for (const s of [-1, 1]) {
      const tx = x + s * 60;
      g.lineStyle(3, O);
      g.fillStyle(0x9a8f80).fillRect(tx - 10, y - 40, 20, 44).strokeRect(tx - 10, y - 40, 20, 44);
      g.fillRect(tx - 13, y - 48, 26, 9).strokeRect(tx - 13, y - 48, 26, 9);
      if (lv.walls >= 5) {
        g.lineStyle(2, O).lineBetween(tx, y - 48, tx, y - 70);
        g.fillStyle(0xffd93b).fillTriangle(tx, y - 70, tx + 14 * s, y - 65, tx, y - 60);
      }
    }
  }
  // The dome
  g.lineStyle(3, O);
  g.fillStyle(0xf2f4f8);
  g.beginPath();
  g.arc(x, y, 46, Math.PI, 0, false);
  g.closePath();
  g.fillPath();
  g.strokePath();
  g.fillStyle(lv.walls >= 5 ? 0xffd93b : 0x2f55c4).fillRect(x - 46, y - 16, 92, 8).strokeRect(x - 46, y - 16, 92, 8);
  g.fillStyle(0x3b3f4a).fillRoundedRect(x - 12, y - 26, 24, 26, { tl: 10, tr: 10, bl: 0, br: 0 });
  // Stone wall in front (walls 1+), taller from level 2
  if (lv.walls >= 1) {
    const h = lv.walls >= 2 ? 14 : 10;
    g.fillStyle(0xb8a98f).fillRect(x - 64, y - h + 6, 128, h).strokeRect(x - 64, y - h + 6, 128, h);
    g.lineStyle(1.5, 0x7a6d58);
    for (let i = -64; i < 64; i += 16) g.lineBetween(x + i, y - h + 6, x + i, y + 6);
    g.lineBetween(x - 64, y - h / 2 + 6, x + 64, y - h / 2 + 6);
  }
  // Ki crystal (reactor), brighter at higher levels
  if (lv.reactor >= 1) {
    const cx = x - 26;
    const cy = y - 44;
    const glow = scene.add.circle(cx, cy, 10 + lv.reactor * 2, 0x5ad8ff, 0.35).setDepth(depth);
    scene.tweens.add({ targets: glow, scale: 1.3, alpha: 0.15, duration: 800, yoyo: true, repeat: -1 });
    const c = scene.add.graphics().setDepth(depth + 0.1);
    c.fillStyle(0x9fe8ff).fillPoints([{ x: cx, y: cy - 12 }, { x: cx + 7, y: cy }, { x: cx, y: cy + 10 }, { x: cx - 7, y: cy }], true);
    c.lineStyle(2, O).strokePoints([{ x: cx, y: cy - 12 }, { x: cx + 7, y: cy }, { x: cx, y: cy + 10 }, { x: cx - 7, y: cy }], true);
    parts.push(glow, c);
  }
  // Cannon turret on the roof: a container that turns toward its target
  let cannon = null;
  if (lv.cannon >= 1) {
    cannon = scene.add.container(x + 14, y - 44).setDepth(depth + 0.2);
    const t = scene.add.graphics();
    const len = 18 + lv.cannon * 2;
    t.fillStyle(0x3b3f4a).fillRoundedRect(-4, -6, len, 12, 4).lineStyle(2.5, O).strokeRoundedRect(-4, -6, len, 12, 4);
    t.fillStyle(0xff8a3d).fillRect(len - 8, -6, 4, 12);
    t.fillStyle(0x6a6f7a).fillCircle(0, 0, 10).lineStyle(2.5, O).strokeCircle(0, 0, 10);
    cannon.add(t);
    cannon.rotation = -Math.PI / 4;
    parts.push(cannon);
  }
  return { parts, cannon };
}
