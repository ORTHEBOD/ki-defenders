import { BASE_UPGRADES, BASE_MAX, baseLevels } from '../data/base.js';
import { drawBase } from '../art/baseArt.js';
import { drawMenuBackground, panel } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save } from '../systems/Save.js';
import { Audio } from '../systems/Audio.js';
import { textStyle } from '../ui/theme.js';

const hex = (c) => `#${c.toString(16).padStart(6, '0')}`;

// Base upgrades: spend coins to make the base stronger in every battle (see data/base.js)
export default class BaseScene extends Phaser.Scene {
  constructor() {
    super('Base');
  }

  create() {
    const player = Save.current();
    if (!player) {
      this.scene.start('Login');
      return;
    }
    drawMenuBackground(this);
    makeButton(this, 90, 40, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 40, 'Your Base', textStyle(44, '#ffd93b')).setOrigin(0.5);
    this.add.image(1110, 40, 'coin');
    this.add.text(1130, 40, `${player.coins}`, textStyle(30, '#ffd93b')).setOrigin(0, 0.5);

    // The base as it looks in battle, drawn big
    const lv = baseLevels(player);
    panel(this, 640, 200, 520, 210);
    const box = this.add.container(640, 250).setScale(1.7);
    box.add(drawBase(this, 0, 0, lv).parts);
    this.add.text(640, 290, 'Upgrades also change how the base looks in battle', textStyle(17, '#9aa3c7')).setOrigin(0.5);

    BASE_UPGRADES.forEach((u, i) => this.card(player, u, lv[u.key], 230 + i * 410, 500));
  }

  card(player, u, level, x, y) {
    panel(this, x, y, 380, 330, u.color);
    this.add.text(x, y - 135, u.name, textStyle(32, hex(u.color))).setOrigin(0.5);
    this.add.text(x, y - 92, u.desc, { ...textStyle(18, '#c9d3ff'), wordWrap: { width: 330 }, align: 'center' }).setOrigin(0.5);
    // Level pips
    for (let i = 0; i < BASE_MAX; i++) {
      this.add.circle(x - 80 + i * 40, y - 40, 13, i < level ? u.color : 0x10131c).setStrokeStyle(3, u.color);
    }
    this.add.text(x, y + 2, `Level ${level} / ${BASE_MAX}`, textStyle(22)).setOrigin(0.5);
    this.add.text(x, y + 34, level ? `Now: ${u.effect(level)}` : 'Not built yet', textStyle(18, '#9bff7a')).setOrigin(0.5);
    if (level >= BASE_MAX) {
      this.add.text(x, y + 100, 'MAX LEVEL', textStyle(30, '#ffd93b')).setOrigin(0.5);
      return;
    }
    this.add.text(x, y + 62, `Next: ${u.effect(level + 1)}`, textStyle(18, '#ffe9c4')).setOrigin(0.5);
    const cost = u.cost[level];
    const b = makeButton(this, x, y + 112, 240, 56, `Upgrade  ${cost}`, () => this.buy(u, cost), { color: 0xc99a00, fontSize: 26 });
    if (player.coins < cost) b.setEnabled(false);
  }

  buy(u, cost) {
    const ok = Save.update((p) => {
      const lv = p.base[u.key] ?? 0;
      if (p.coins < cost || lv >= BASE_MAX) return false;
      p.coins -= cost;
      p.base[u.key] = lv + 1;
      return true;
    });
    if (!ok) return;
    Audio.sfx('coin');
    this.scene.restart();
  }
}
