import { pts } from '../art/fighterArt.js';

const W = 1280;
const H = 720;

// Purple evening sky, an energy sun, mountains, and ki sparks floating up.
// Uses the painted picture (art/menu_bg.jpg, made with ComfyUI) when it loaded, else draws it.
export function drawMenuBackground(scene) {
  const g = scene.add.graphics();
  if (scene.textures.exists('menu_bg')) {
    scene.add.image(W / 2, H / 2, 'menu_bg').setDisplaySize(W, H).setDepth(-2);
    // Darker at the top and bottom, so the titles and buttons stay easy to read
    g.fillGradientStyle(0x0d0a24, 0x0d0a24, 0x0d0a24, 0x0d0a24, 0.55, 0.55, 0.1, 0.1).fillRect(0, 0, W, H * 0.45);
    g.fillGradientStyle(0x0d0a24, 0x0d0a24, 0x0d0a24, 0x0d0a24, 0.1, 0.1, 0.6, 0.6).fillRect(0, H * 0.45, W, H * 0.55);
    g.setDepth(-1);
    sparks(scene);
    return g;
  }
  g.fillGradientStyle(0x1b1442, 0x1b1442, 0x5a2a5e, 0x5a2a5e, 1).fillRect(0, 0, W, H);
  // Twinkling stars high in the sky
  for (let i = 0; i < 50; i++) {
    g.fillStyle(0xffffff, Math.random() * 0.6 + 0.2).fillCircle(Math.random() * W, Math.random() * 300, Math.random() * 1.6 + 0.4);
  }
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

  sparks(scene);
  return g;
}

// Ki sparks floating up
function sparks(scene) {
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
}

// A dark rounded panel
export function panel(scene, x, y, w, h, stroke = 0xffd93b) {
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.3).fillRoundedRect(x - w / 2 + 4, y - h / 2 + 6, w, h, 16);
  g.fillStyle(0x10131c, 0.92).fillRoundedRect(x - w / 2, y - h / 2, w, h, 16);
  g.fillStyle(0xffffff, 0.04).fillRoundedRect(x - w / 2 + 4, y - h / 2 + 4, w - 8, Math.min(60, h / 3), 12);
  g.lineStyle(3, stroke, 0.9).strokeRoundedRect(x - w / 2, y - h / 2, w, h, 16);
  g.lineStyle(1, 0xffffff, 0.12).strokeRoundedRect(x - w / 2 + 5, y - h / 2 + 5, w - 10, h - 10, 12);
  return g;
}

export function xpBar(scene, x, y, w, h, ratio, color = 0x3fd0f5) {
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.6).fillRoundedRect(x, y, w, h, h / 2);
  if (ratio > 0) g.fillStyle(color).fillRoundedRect(x, y, Math.max(h, w * ratio), h, h / 2);
  g.lineStyle(2, 0xffffff, 0.6).strokeRoundedRect(x, y, w, h, h / 2);
  return g;
}
