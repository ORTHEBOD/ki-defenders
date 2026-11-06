import { LEVELS, MAPS } from '../data/levels.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { drawMenuBackground, panel } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save } from '../systems/Save.js';
import { textStyle } from '../ui/theme.js';

const starText = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelect');
  }

  create(data) {
    this.player = Save.current();
    if (!this.player) {
      this.scene.start('Login');
      return;
    }
    drawMenuBackground(this);
    makeButton(this, 90, 50, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 50, 'Choose a level', textStyle(52, '#ffd93b')).setOrigin(0.5);

    // Map tabs
    this.mapIndex = data?.mapIndex ?? this.defaultMap();
    this.tabs = MAPS.map((m, i) => makeButton(this, 310 + i * 330, 125, 310, 54, m.name, () => this.showMap(i),
      { fontSize: 26, color: 0x2a3350 }));
    this.mapLayer = this.add.container(0, 0);
    this.showMap(this.mapIndex);
  }

  stars(id) {
    return this.player.stars[id] || 0;
  }

  isUnlocked(id) {
    return id === 1 || this.stars(id - 1) > 0;
  }

  // Open the map that holds the newest unlocked level
  defaultMap() {
    let best = 0;
    MAPS.forEach((m, i) => {
      if (m.levels.some((id) => this.isUnlocked(id))) best = i;
    });
    return best;
  }

  showMap(i) {
    this.mapIndex = i;
    this.tabs.forEach((t, j) => t.setAlpha(j === i ? 1 : 0.6));
    this.mapLayer.removeAll(true);
    const map = MAPS[i];

    const bg = this.add.graphics();
    bg.fillStyle(map.color, 0.35).fillRoundedRect(60, 170, 1160, 500, 20);
    bg.lineStyle(3, map.color, 0.9).strokeRoundedRect(60, 170, 1160, 500, 20);
    // Dotted road between the levels
    bg.fillStyle(0xffffff, 0.5);
    for (let n = 0; n < map.nodes.length - 1; n++) {
      const [x1, y1] = map.nodes[n];
      const [x2, y2] = map.nodes[n + 1];
      const steps = Math.floor(Math.hypot(x2 - x1, y2 - y1) / 22);
      for (let s = 1; s < steps; s++) bg.fillCircle(x1 + ((x2 - x1) * s) / steps, y1 + ((y2 - y1) * s) / steps, 4);
    }
    this.mapLayer.add(bg);

    map.levels.forEach((id, n) => {
      const [x, y] = map.nodes[n];
      const exists = LEVELS.some((l) => l.id === id);
      const open = exists && this.isUnlocked(id);
      const circle = this.add.circle(x, y, 52, open ? 0xe0661a : 0x3a3f52).setStrokeStyle(5, open ? 0xffd93b : 0x1a1d28);
      const label = this.add.text(x, y, open ? `${id}` : '🔒', open ? textStyle(48) : { fontSize: '36px' }).setOrigin(0.5);
      const sub = exists
        ? this.add.text(x, y + 76, starText(this.stars(id)), textStyle(30, '#ffd93b')).setOrigin(0.5)
        : this.add.text(x, y + 76, 'Coming soon', textStyle(22, '#9aa3c7')).setOrigin(0.5);
      this.mapLayer.add([circle, label, sub]);
      if (open) {
        circle.setInteractive({ useHandCursor: true });
        circle.on('pointerdown', () => this.openLevel(id));
        this.tweens.add({ targets: circle, scale: 1.06, duration: 700, yoyo: true, repeat: -1 });
      }
    });
  }

  openLevel(id) {
    const level = LEVELS.find((l) => l.id === id);
    const pop = this.add.container(0, 0).setDepth(200);
    pop.add(this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6).setOrigin(0).setInteractive());
    pop.add(panel(this, 640, 380, 640, 400));
    pop.add(this.add.text(640, 225, level.name, textStyle(40, '#ffd93b')).setOrigin(0.5));
    pop.add(this.add.text(640, 275, `${level.waves.length} waves   -   Best: ${starText(this.stars(id))}`,
      textStyle(24, '#c9d3ff')).setOrigin(0.5));
    pop.add(this.add.text(640, 318, 'Choose difficulty', textStyle(28)).setOrigin(0.5));

    Object.entries(DIFFICULTY).forEach(([key, d], i) => {
      const x = 440 + i * 200;
      const b = makeButton(this, x, 400, 180, 80, d.label, () => {
        this.scene.start('Game', { levelId: id, difficulty: key, mapIndex: this.mapIndex });
      }, { color: d.color, fontSize: 32 });
      pop.add([b, this.add.text(x, 465, starText(d.stars), textStyle(24, '#ffd93b')).setOrigin(0.5)]);
    });
    pop.add(makeButton(this, 640, 535, 200, 50, 'Cancel', () => {
      pop.setVisible(false);
      this.time.delayedCall(1, () => pop.destroy());
    }, { fontSize: 24, color: 0x3a4470 }));
  }
}
