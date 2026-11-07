import { HEROES, xpToNext, skillPoints } from '../data/hero.js';
import { fighterPortrait } from '../art/fighterArt.js';
import { drawMenuBackground, panel, xpBar } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save, totalStars, activeHero } from '../systems/Save.js';
import { Audio } from '../systems/Audio.js';
import { textStyle } from '../ui/theme.js';

// Endless mode opens after this level is won
export const ENDLESS_AFTER = 3;

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
    Audio.music('menu');
    drawMenuBackground(this);

    // Top bar: name, stars, coins, settings and log out
    this.add.rectangle(0, 0, 1280, 64, 0x10131c, 0.85).setOrigin(0);
    this.add.text(24, 32, 'KI DEFENDERS', textStyle(38, '#ffd93b')).setOrigin(0, 0.5);
    this.add.text(330, 32, `★ ${totalStars(player)}`, textStyle(30, '#ffd93b')).setOrigin(0, 0.5);
    this.add.image(450, 32, 'coin');
    this.add.text(470, 32, `${player.coins}`, textStyle(30, '#ffd93b')).setOrigin(0, 0.5);
    this.add.text(960, 32, player.name, textStyle(30)).setOrigin(1, 0.5);
    makeButton(this, 1050, 32, 140, 44, 'Settings', () => this.scene.start('Settings', { back: 'Hub' }),
      { fontSize: 22, color: 0x3a4470 });
    makeButton(this, 1200, 32, 130, 44, 'Log out', () => {
      Save.logout();
      this.scene.start('Login');
    }, { fontSize: 22, color: 0x3a4470 });

    // Hero card: the hero in use right now
    const hero = activeHero(player);
    const def = HEROES[player.activeHero] ?? HEROES.zenko;
    panel(this, 330, 400, 500, 520, def.look.gi);
    const art = fighterPortrait(this, 330, 290, def.look, 3.6);
    this.tweens.add({ targets: art, y: art.y - 8, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.text(330, 440, def.name, textStyle(48)).setOrigin(0.5);
    this.add.text(330, 482, def.title, textStyle(22, '#c9d3ff')).setOrigin(0.5);
    this.add.text(330, 522, `Level ${hero.level}`, textStyle(32, '#ffd93b')).setOrigin(0.5);
    const need = xpToNext(hero.level);
    xpBar(this, 150, 550, 360, 22, hero.xp / need);
    this.add.text(330, 590, `XP ${hero.xp} / ${need}`, textStyle(22, '#c9d3ff')).setOrigin(0.5);
    const sp = skillPoints(hero);
    this.add.text(330, 626, `Skill points: ${sp}`, textStyle(24, sp > 0 ? '#5be35b' : '#c9d3ff')).setOrigin(0.5);

    // Main buttons
    makeButton(this, 830, 190, 420, 100, 'Play', () => this.scene.start('LevelSelect'), { color: 0xe0661a, fontSize: 56 });
    makeButton(this, 830, 300, 420, 76, 'Heroes', () => this.scene.start('Hero'), { color: 0xb8303a, fontSize: 36 });
    makeButton(this, 830, 392, 420, 76, 'Shop', () => this.scene.start('Shop'), { color: 0x2f8a4a, fontSize: 36 });
    const endlessOpen = (player.stars[ENDLESS_AFTER] || 0) > 0;
    const endless = makeButton(this, 830, 484, 420, 76,
      endlessOpen ? `Endless Battle  (best: wave ${player.endlessBest})` : `Endless Battle  (win level ${ENDLESS_AFTER})`,
      () => this.scene.start('Game', { levelId: 'endless', difficulty: 'normal' }), { color: 0x6a3ab8, fontSize: 28 });
    endless.setEnabled(endlessOpen);
    makeButton(this, 830, 576, 420, 76, 'Leaderboard', () => this.scene.start('Leaderboard'), { fontSize: 32 });
    if (skillPoints(hero) > 0) {
      const dot = this.add.circle(1015, 278, 14, 0x5be35b).setStrokeStyle(3, 0x10131c).setDepth(120);
      this.add.text(1015, 278, '!', textStyle(20)).setOrigin(0.5).setDepth(121);
      this.tweens.add({ targets: dot, scale: 1.2, duration: 500, yoyo: true, repeat: -1 });
    }

    if (data && data.welcome) {
      const t = this.add.text(830, 660, data.welcome, textStyle(30, '#5be35b')).setOrigin(0.5);
      this.tweens.add({ targets: t, alpha: 0, delay: 2200, duration: 600 });
    }
  }
}
