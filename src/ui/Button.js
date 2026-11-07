import { COLORS, textStyle } from './theme.js';
import { Audio } from '../systems/Audio.js';

// A rounded, glossy button with a drop shadow. Returns a container with setLabel / setEnabled.
export function makeButton(scene, x, y, w, h, label, onClick, opts = {}) {
  const color = opts.color ?? COLORS.card;
  const hover = Phaser.Display.Color.ValueToColor(color).lighten(15).color;
  const r = Math.min(14, h / 3);

  const c = scene.add.container(x, y).setDepth(opts.depth ?? 110);
  const g = scene.add.graphics();
  const draw = (fill) => {
    g.clear();
    g.fillStyle(0x000000, 0.35).fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, r);
    g.fillStyle(fill).fillRoundedRect(-w / 2, -h / 2, w, h, r);
    g.fillStyle(0xffffff, 0.16).fillRoundedRect(-w / 2 + 4, -h / 2 + 3, w - 8, h * 0.42, { tl: r - 2, tr: r - 2, bl: 3, br: 3 });
    g.lineStyle(3, COLORS.panel).strokeRoundedRect(-w / 2, -h / 2, w, h, r);
  };
  draw(color);
  // Invisible hit area (its fill is see-through, so it still gets taps)
  const bg = scene.add.rectangle(0, 0, w, h, 0x000000, 0);
  const txt = scene.add.text(0, 0, label, textStyle(opts.fontSize ?? 26)).setOrigin(0.5);
  c.add([g, bg, txt]);
  c.enabled = true;

  bg.setInteractive({ useHandCursor: true });
  bg.on('pointerover', () => c.enabled && draw(hover));
  bg.on('pointerout', () => draw(color));
  bg.on('pointerdown', () => {
    // Lets the scene know this tap was on a button, not on the map
    scene.uiClickFrame = scene.game.loop.frame;
    if (!c.enabled) return;
    Audio.sfx('click');
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
