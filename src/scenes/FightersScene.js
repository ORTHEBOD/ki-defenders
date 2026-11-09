import { FIGHTERS, FORMS, FORM_LEVELS } from '../data/fighters.js';
import { fighterPortrait } from '../art/fighterArt.js';
import { drawMenuBackground, panel } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save } from '../systems/Save.js';
import { levelOpen, maxForm } from '../systems/Progress.js';
import { textStyle } from '../ui/theme.js';

const hex = (c) => `#${c.toString(16).padStart(6, '0')}`;

// The fighters (towers): who has joined the team, and how far they can power up.
// New fighters join at certain levels, and the story opens higher forms (see FORM_LEVELS).
export default class FightersScene extends Phaser.Scene {
  constructor() {
    super('Fighters');
  }

  create() {
    const player = Save.current();
    if (!player) {
      this.scene.start('Login');
      return;
    }
    drawMenuBackground(this);
    makeButton(this, 90, 40, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 40, 'Fighters', textStyle(44, '#ffd93b')).setOrigin(0.5);
    this.add.text(640, 84, 'In battle, fighters earn EXP by defeating enemies. Spend Ki to upgrade them.',
      textStyle(20, '#c9d3ff')).setOrigin(0.5);

    const top = maxForm(player);
    const form = FORMS[top];

    // One card per fighter, shown in the highest form the story has opened
    Object.values(FIGHTERS).forEach((def, i) => {
      const x = 160 + i * 240;
      const joined = player.super || def.unlock === 1 || levelOpen(player, def.unlock);
      panel(this, x, 270, 220, 300, joined ? def.color : 0x3a3f52);
      const look = { ...def.look, hair: form.hair ?? def.look.hair, longHair: form.longHair, sparks: form.sparks };
      const art = fighterPortrait(this, x, 220, joined ? look : { ...def.look, gi: 0x202430, skin: 0x202430, hair: 0x202430, belt: 0x202430, boots: 0x202430 }, 2.6);
      if (!joined) this.add.text(x, 220, '🔒', { fontSize: '44px' }).setOrigin(0.5);
      else this.tweens.add({ targets: art, y: art.y - 6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut', delay: i * 150 });
      this.add.text(x, 330, def.name, textStyle(30, joined ? '#ffffff' : '#8a91ad')).setOrigin(0.5);
      this.add.text(x, 362, def.role, textStyle(20, '#c9d3ff')).setOrigin(0.5);
      this.add.text(x, 398, joined ? `Up to ${form.name}` : `Joins at level ${def.unlock}`,
        textStyle(19, joined ? form.color : '#ffd93b')).setOrigin(0.5);
    });

    // The forms, and the story level that opens each one
    panel(this, 640, 560, 1200, 190);
    this.add.text(640, 488, 'Forms open as you beat the story', textStyle(26, '#ffd93b')).setOrigin(0.5);
    FORMS.forEach((f, i) => {
      const x = 140 + i * 200;
      const open = i <= top;
      const color = i === 0 ? 0xffffff : f.aura;
      this.add.circle(x, 560, 30, open ? color : 0x10131c, open ? 0.9 : 1).setStrokeStyle(4, color, open ? 1 : 0.4);
      this.add.text(x, 560, open ? '✓' : '🔒', { ...textStyle(26, '#10131c'), fontSize: open ? '30px' : '24px' }).setOrigin(0.5);
      this.add.text(x, 610, f.name, textStyle(20, open ? hex(color) : '#8a91ad')).setOrigin(0.5);
      this.add.text(x, 636, i === 0 ? 'From the start' : `Beat level ${FORM_LEVELS[i]}`, textStyle(17, '#9aa3c7')).setOrigin(0.5);
      if (i < FORMS.length - 1) this.add.text(x + 100, 560, '›', textStyle(34, '#5a6378')).setOrigin(0.5);
    });
  }
}
