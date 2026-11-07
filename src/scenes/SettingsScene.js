import { drawMenuBackground, panel } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Settings } from '../systems/Settings.js';
import { Audio } from '../systems/Audio.js';
import { Save } from '../systems/Save.js';
import { textStyle } from '../ui/theme.js';

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super('Settings');
  }

  create(data = {}) {
    this.back = data.back ?? 'Hub';
    drawMenuBackground(this);
    makeButton(this, 90, 40, 140, 50, '< Back', () => this.scene.start(this.back), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 40, 'Settings', textStyle(52, '#ffd93b')).setOrigin(0.5);
    panel(this, 640, 390, 820, 560);
    this.layer = this.add.container(0, 0);
    this.draw();
  }

  draw() {
    this.layer.removeAll(true);
    const L = this.layer;
    this.volumeRow(L, 160, 'Music', 'music');
    this.volumeRow(L, 230, 'Sound effects', 'sfx');
    this.toggleRow(L, 300, 'Damage numbers', 'damageNumbers');
    this.toggleRow(L, 370, 'Screen shake', 'screenShake');

    // Game speed at the start of every battle
    L.add(this.add.text(300, 440, 'Start speed', textStyle(30)).setOrigin(0, 0.5));
    [1, 2, 3].forEach((s, i) => {
      const on = Settings.get('startSpeed') === s;
      L.add(makeButton(this, 720 + i * 110, 440, 96, 50, `${s}x`, () => {
        Settings.set('startSpeed', s);
        this.draw();
      }, { fontSize: 26, color: on ? 0xe0661a : 0x2a3350 }));
    });

    L.add(this.add.text(300, 510, 'Full screen', textStyle(30)).setOrigin(0, 0.5));
    L.add(makeButton(this, 830, 510, 316, 50, this.scale.isFullscreen ? 'Exit full screen' : 'Go full screen', () => {
      if (this.scale.isFullscreen) this.scale.stopFullscreen();
      else this.scale.startFullscreen();
      this.time.delayedCall(300, () => this.draw());
    }, { fontSize: 24 }));
    L.add(this.add.text(300, 580, 'Tutorial', textStyle(30)).setOrigin(0, 0.5));
    const tut = makeButton(this, 830, 580, 316, 50, 'Show it again', () => {
      Save.update((p) => { p.tutorialDone = false; });
      tut.setLabel('On in level 1');
      tut.setEnabled(false);
    }, { fontSize: 24 });
    tut.setEnabled(!!Save.current());
    L.add(tut);
  }

  // A 0-100% volume control with - and + buttons
  volumeRow(L, y, label, key) {
    const v = Settings.get(key);
    L.add(this.add.text(300, y, label, textStyle(30)).setOrigin(0, 0.5));
    const set = (nv) => {
      Settings.set(key, Math.round(Phaser.Math.Clamp(nv, 0, 1) * 10) / 10);
      Audio.applyVolumes();
      if (key === 'sfx') Audio.sfx('coin');
      this.draw();
    };
    L.add(makeButton(this, 640, y, 56, 50, '-', () => set(v - 0.1), { fontSize: 32 }));
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.6).fillRoundedRect(680, y - 12, 220, 24, 12);
    if (v > 0) g.fillStyle(0x3fd0f5).fillRoundedRect(680, y - 12, Math.max(24, 220 * v), 24, 12);
    L.add(g);
    L.add(this.add.text(790, y, v > 0 ? `${Math.round(v * 100)}%` : 'Off', textStyle(20)).setOrigin(0.5));
    L.add(makeButton(this, 940, y, 56, 50, '+', () => set(v + 0.1), { fontSize: 32 }));
  }

  toggleRow(L, y, label, key) {
    const on = Settings.get(key);
    L.add(this.add.text(300, y, label, textStyle(30)).setOrigin(0, 0.5));
    L.add(makeButton(this, 830, y, 316, 50, on ? 'On' : 'Off', () => {
      Settings.set(key, !on);
      this.draw();
    }, { fontSize: 26, color: on ? 0x2f8a4a : 0x8a2f3a }));
  }
}
