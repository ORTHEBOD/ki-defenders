import { HERO, xpToNext, skillPoints } from '../data/hero.js';
import { fighterPortrait } from '../art/fighterArt.js';
import { drawMenuBackground, panel, xpBar } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save } from '../systems/Save.js';
import { textStyle } from '../ui/theme.js';

export default class HeroScene extends Phaser.Scene {
  constructor() {
    super('Hero');
  }

  create() {
    const player = Save.current();
    if (!player) {
      this.scene.start('Login');
      return;
    }
    const hero = player.hero;
    drawMenuBackground(this);
    makeButton(this, 90, 50, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 50, 'Hero', textStyle(56, '#ffd93b')).setOrigin(0.5);

    // Hero info
    panel(this, 230, 400, 360, 540, 0xd8442b);
    fighterPortrait(this, 230, 270, HERO.look, 3.2);
    this.add.text(230, 410, HERO.name, textStyle(44)).setOrigin(0.5);
    this.add.text(230, 458, `Level ${hero.level}`, textStyle(30, '#ffd93b')).setOrigin(0.5);
    const need = xpToNext(hero.level);
    xpBar(this, 90, 490, 280, 20, hero.xp / need);
    this.add.text(230, 530, `XP ${hero.xp} / ${need}`, textStyle(20, '#c9d3ff')).setOrigin(0.5);
    this.add.text(230, 580, `Skill points: ${skillPoints(hero)}`, textStyle(26, '#5be35b')).setOrigin(0.5);
    this.add.text(230, 625, 'Earn XP by winning levels', textStyle(18, '#9aa3c7')).setOrigin(0.5);

    // Skill tree: 3 branches, 4 skills each
    panel(this, 820, 400, 820, 540);
    this.add.text(820, 165, 'Skill tree', textStyle(36)).setOrigin(0.5);
    HERO.skillTree.forEach((branch, b) => {
      const x = 560 + b * 260;
      const hex = `#${branch.color.toString(16).padStart(6, '0')}`;
      this.add.text(x, 215, branch.branch, textStyle(28, hex)).setOrigin(0.5);
      const line = this.add.graphics();
      line.lineStyle(4, branch.color, 0.35).lineBetween(x, 260, x, 560);
      branch.skills.forEach((name, i) => {
        const y = 270 + i * 96;
        this.add.circle(x, y, 26, 0x10131c).setStrokeStyle(4, branch.color, 0.5);
        this.add.text(x, y, '🔒', { fontSize: '20px' }).setOrigin(0.5).setAlpha(0.7);
        this.add.text(x, y + 40, name, textStyle(20, '#c9d3ff')).setOrigin(0.5);
      });
    });
    this.add.text(820, 640, 'Zenko joins the battle in Phase 3. Then you can spend skill points here.',
      textStyle(20, '#ffe9c4')).setOrigin(0.5);
  }
}
