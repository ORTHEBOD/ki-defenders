import { HERO, xpToNext, skillPoints } from '../data/hero.js';
import { fighterPortrait } from '../art/fighterArt.js';
import { drawMenuBackground, panel, xpBar } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save, totalStars } from '../systems/Save.js';
import { textStyle } from '../ui/theme.js';

export default class HubScene extends Phaser.Scene {
  constructor() {
    super('Hub');
  }

  create(data) {
    const player = Save.current();
    if (!player) {
      this.scene.start('Login');
      return;
    }
    drawMenuBackground(this);

    // Top bar
    this.add.rectangle(0, 0, 1280, 64, 0x10131c, 0.85).setOrigin(0);
    this.add.text(24, 32, 'KI DEFENDERS', textStyle(38, '#ffd93b')).setOrigin(0, 0.5);
    this.add.text(1100, 32, player.name, textStyle(30)).setOrigin(1, 0.5);
    makeButton(this, 1190, 32, 140, 44, 'Log out', () => {
      Save.logout();
      this.scene.start('Login');
    }, { fontSize: 22, color: 0x3a4470 });

    // Hero card
    const hero = player.hero;
    panel(this, 380, 400, 520, 500, 0xd8442b);
    const art = fighterPortrait(this, 380, 300, HERO.look, 3.6);
    this.tweens.add({ targets: art, y: art.y - 8, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.text(380, 450, HERO.name, textStyle(48)).setOrigin(0.5);
    this.add.text(380, 500, `Level ${hero.level}`, textStyle(32, '#ffd93b')).setOrigin(0.5);
    const need = xpToNext(hero.level);
    xpBar(this, 190, 530, 380, 22, hero.xp / need);
    this.add.text(380, 572, `XP ${hero.xp} / ${need}`, textStyle(22, '#c9d3ff')).setOrigin(0.5);
    const sp = skillPoints(hero);
    this.add.text(380, 612, `Skill points: ${sp}`, textStyle(24, sp > 0 ? '#5be35b' : '#c9d3ff')).setOrigin(0.5);

    // Main buttons
    this.add.text(920, 170, `★ ${totalStars(player)} stars`, textStyle(36, '#ffd93b')).setOrigin(0.5);
    makeButton(this, 920, 280, 380, 96, 'Play', () => this.scene.start('LevelSelect'), { color: 0xe0661a, fontSize: 52 });
    makeButton(this, 920, 400, 380, 80, 'Hero', () => this.scene.start('Hero'), { color: 0xb8303a, fontSize: 40 });
    const lb = makeButton(this, 920, 505, 380, 70, 'Leaderboard (soon)', () => {}, { fontSize: 30 });
    lb.setEnabled(false);

    if (data && data.welcome) {
      const t = this.add.text(920, 610, data.welcome, textStyle(34, '#5be35b')).setOrigin(0.5);
      this.tweens.add({ targets: t, alpha: 0, delay: 2200, duration: 600 });
    }
  }
}
