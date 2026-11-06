import { COLORS, textStyle } from './theme.js';

export function makeButton(scene, x, y, w, h, label, onClick, opts = {}) {
  const color = opts.color ?? COLORS.card;
  const hover = Phaser.Display.Color.ValueToColor(color).lighten(15).color;

  const c = scene.add.container(x, y).setDepth(opts.depth ?? 110);
  const bg = scene.add.rectangle(0, 0, w, h, color).setStrokeStyle(3, COLORS.panel);
  const txt = scene.add.text(0, 0, label, textStyle(opts.fontSize ?? 26)).setOrigin(0.5);
  c.add([bg, txt]);
  c.enabled = true;

  bg.setInteractive({ useHandCursor: true });
  bg.on('pointerover', () => c.enabled && bg.setFillStyle(hover));
  bg.on('pointerout', () => bg.setFillStyle(color));
  bg.on('pointerdown', () => {
    if (!c.enabled) return;
    scene.tweens.add({ targets: c, scale: 0.94, duration: 60, yoyo: true });
    onClick();
  });

  c.setLabel = (s) => txt.setText(s);
  c.setEnabled = (v) => {
    c.enabled = v;
    c.setAlpha(v ? 1 : 0.55);
  };
  return c;
}
