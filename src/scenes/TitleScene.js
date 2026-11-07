import { FIGHTERS } from '../data/fighters.js';
import { HERO } from '../data/hero.js';
import { fighterPortrait } from '../art/fighterArt.js';
import { drawMenuBackground } from '../ui/menuBackground.js';
import { Save } from '../systems/Save.js';
import { textStyle } from '../ui/theme.js';
import { Audio } from '../systems/Audio.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    drawMenuBackground(this);

    const logo = this.add.text(640, 170, 'KI DEFENDERS', textStyle(130, '#ffd93b')).setOrigin(0.5);
    logo.setStroke('#7a2a10', 14);
    this.tweens.add({ targets: logo, y: 160, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.text(640, 260, 'Defend the planet. Power up. Transform.', textStyle(32, '#ffe9c4')).setOrigin(0.5);

    // The team lined up: hero in the middle, fighters on the sides
    const team = [FIGHTERS.ronin.look, HERO.look, FIGHTERS.kaito.look];
    [[440, 470, 2.6], [640, 455, 3.4], [840, 470, 2.6]].forEach(([x, y, s], i) => {
      const art = fighterPortrait(this, x, y, team[i], s);
      this.tweens.add({ targets: art, y: art.y - 8, duration: 900 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    });

    const tap = this.add.text(640, 640, 'Tap to start', textStyle(40)).setOrigin(0.5);
    this.tweens.add({ targets: tap, alpha: 0.25, duration: 700, yoyo: true, repeat: -1 });
    this.add.text(1265, 705, 'v0.6', textStyle(18, '#9aa3c7')).setOrigin(1, 1);

    Audio.music('menu');
    this.input.once('pointerdown', () => {
      Audio.unlock();
      this.scene.start(Save.current() ? 'Hub' : 'Login');
    });
  }
}
