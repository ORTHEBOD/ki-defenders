import { pts } from '../art/fighterArt.js';

const W = 1280;
const H = 720;

// Purple evening sky, an energy sun, mountains, and ki sparks floating up
export function drawMenuBackground(scene) {
  const g = scene.add.graphics();
  g.fillGradientStyle(0x1b1442, 0x1b1442, 0x5a2a5e, 0x5a2a5e, 1).fillRect(0, 0, W, H);
  g.fillStyle(0xffb347, 0.12).fillCircle(980, 250, 230);
  g.fillStyle(0xffd27a, 0.22).fillCircle(980, 250, 150);
  g.fillStyle(0xffe9a8, 0.9).fillCircle(980, 250, 72);
  g.fillStyle(0x2a1d4a).fillPoints(pts([
    [0, 520], [140, 380], [260, 470], [420, 330], [560, 460], [720, 350], [880, 480],
    [1040, 360], [1180, 450], [1280, 400], [1280, 720], [0, 720],
  ]), true);
  g.fillStyle(0x1a1230).fillPoints(pts([
    [0, 600], [180, 510], [340, 580], [520, 495], [700, 590], [900, 515], [1080, 590],
    [1280, 525], [1280, 720], [0, 720],
  ]), true);

  for (let i = 0; i < 26; i++) {
    const c = scene.add.circle(
      Phaser.Math.Between(0, W), Phaser.Math.Between(320, H),
      Phaser.Math.Between(2, 4), 0xffd93b, 0.7,
    );
    scene.tweens.add({
      targets: c,
      y: c.y - Phaser.Math.Between(200, 420),
      alpha: 0,
      duration: Phaser.Math.Between(3000, 6000),
      delay: Phaser.Math.Between(0, 3000),
      repeat: -1,
    });
  }
  return g;
}

// A dark rounded panel
export function panel(scene, x, y, w, h, stroke = 0xffd93b) {
  const g = scene.add.graphics();
  g.fillStyle(0x10131c, 0.9).fillRoundedRect(x - w / 2, y - h / 2, w, h, 16);
  g.lineStyle(3, stroke, 0.9).strokeRoundedRect(x - w / 2, y - h / 2, w, h, 16);
  return g;
}

export function xpBar(scene, x, y, w, h, ratio, color = 0x3fd0f5) {
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.6).fillRoundedRect(x, y, w, h, h / 2);
  if (ratio > 0) g.fillStyle(color).fillRoundedRect(x, y, Math.max(h, w * ratio), h, h / 2);
  g.lineStyle(2, 0xffffff, 0.6).strokeRoundedRect(x, y, w, h, h / 2);
  return g;
}
