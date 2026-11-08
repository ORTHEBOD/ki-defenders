import { LEVELS, MAPS, NODES } from '../data/levels.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { storyBefore } from '../data/story.js';
import { drawMenuBackground, panel } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save, totalStars } from '../systems/Save.js';
import { mapOpen, levelOpen } from '../systems/Progress.js';
import { drawAreaMap, drawLevelNode } from '../art/mapArt.js';
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
    makeButton(this, 90, 40, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 40, 'Choose a level', textStyle(48, '#ffd93b')).setOrigin(0.5);
    this.add.text(1200, 40, `★ ${totalStars(this.player)}`, textStyle(34, '#ffd93b')).setOrigin(1, 0.5);

    // Map tabs (an area opens after its stars are earned)
    this.mapIndex = data?.mapIndex ?? this.defaultMap();
    if (!this.mapOpen(this.mapIndex)) this.mapIndex = 0;
    this.tabs = MAPS.map((m, i) => {
      const open = this.mapOpen(i);
      return makeButton(this, 190 + i * 300, 108, 284, 54, open ? m.name : `🔒 ${m.name}`, () => this.showMap(i),
        { fontSize: 24, color: 0x2a3350 });
    });
    // The next area is still being made
    const soon = makeButton(this, 190 + MAPS.length * 300, 108, 284, 54, '✨ Coming soon', () => this.showSoon(),
      { fontSize: 24, color: 0x4a2a6a });
    soon.setAlpha(0.75);
    this.mapLayer = this.add.container(0, 0);
    this.showMap(this.mapIndex);
  }

  stars(id) {
    return this.player.stars[id] || 0;
  }

  mapOpen(i) {
    return mapOpen(this.player, i);
  }

  // A level opens once the level before it has been won (the first level of an area opens with the area)
  isUnlocked(id) {
    return levelOpen(this.player, id);
  }

  // Open the map that holds the newest unlocked level
  defaultMap() {
    let best = 0;
    MAPS.forEach((m, i) => {
      if (this.mapOpen(i)) best = i;
    });
    return best;
  }

  showMap(i) {
    if (!this.mapOpen(i)) {
      this.showLocked(i);
      return;
    }
    this.mapLayer.removeAll(true);
    this.mapIndex = i;
    this.tabs.forEach((t, j) => t.setAlpha(j === i ? 1 : 0.6));
    const map = MAPS[i];

    this.mapLayer.add(drawAreaMap(this, i));
    const got = LEVELS.filter((l) => l.map === i).reduce((a, l) => a + this.stars(l.id), 0);
    this.mapLayer.add(this.add.text(1210, 680, `${map.name}: ★ ${got} / 30`, textStyle(24, '#ffd93b')).setOrigin(1, 0.5));

    NODES.forEach(([x, y], n) => {
      const id = i * 10 + n + 1;
      const level = LEVELS.find((l) => l.id === id);
      const open = this.isUnlocked(id);
      const boss = n === 9;
      const r = boss ? 48 : 40;
      const fill = !open ? 0x3a3f52 : boss ? 0xb8303a : level.maze ? 0x6a3ab8 : 0xe0661a;
      const next = open && this.stars(id) === 0;
      const node = this.add.container(x, y);
      if (next) {
        // The level to play next glows
        const glow = this.add.circle(0, 0, r + 16, 0xffd93b, 0.35);
        node.add(glow);
        this.tweens.add({ targets: glow, scale: 1.25, alpha: 0, duration: 1100, repeat: -1 });
      }
      node.add(drawLevelNode(this, 0, 0, r, fill, open ? 0xffd93b : 0x1a1d28));
      node.add(this.add.text(0, -2, open ? `${id}` : '🔒', open ? textStyle(boss ? 40 : 34) : { fontSize: '28px' }).setOrigin(0.5));
      const sub = this.add.text(x, y + r + 20, starText(this.stars(id)), textStyle(22, '#ffd93b')).setOrigin(0.5);
      this.mapLayer.add([node, sub]);
      if (boss) this.mapLayer.add(this.add.text(x, y - r - 20, 'BOSS', textStyle(22, '#ff8a8a')).setOrigin(0.5));
      else if (level.maze) this.mapLayer.add(this.add.text(x, y - r - 20, 'MAZE', textStyle(20, '#c9a8ff')).setOrigin(0.5));
      if (open) {
        node.setSize(r * 2, r * 2).setInteractive({ useHandCursor: true });
        node.on('pointerdown', () => this.openLevel(id));
        if (next) this.tweens.add({ targets: node, scale: 1.06, duration: 700, yoyo: true, repeat: -1 });
      }
    });
  }

  showLocked(i) {
    const map = MAPS[i];
    const pop = this.add.container(0, 0).setDepth(200);
    pop.add(this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.5).setOrigin(0).setInteractive());
    pop.add(panel(this, 640, 400, 640, 300, map.color));
    pop.add(this.add.text(640, 300, `🔒 ${map.name}`, textStyle(40, '#ffd93b')).setOrigin(0.5));
    const prev = i * 10;
    const needLevel = this.stars(prev) > 0 ? '✔' : '✘';
    const haveStars = totalStars(this.player) >= map.needStars ? '✔' : '✘';
    pop.add(this.add.text(640, 370, `${needLevel}  Win level ${prev}`, textStyle(28)).setOrigin(0.5));
    pop.add(this.add.text(640, 412, `${haveStars}  Collect ★ ${map.needStars} stars (you have ${totalStars(this.player)})`, textStyle(28)).setOrigin(0.5));
    pop.add(makeButton(this, 640, 495, 200, 50, 'OK', () => {
      pop.setVisible(false);
      this.time.delayedCall(1, () => pop.destroy());
    }, { fontSize: 26 }));
  }

  showSoon() {
    const pop = this.add.container(0, 0).setDepth(200);
    pop.add(this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.5).setOrigin(0).setInteractive());
    pop.add(panel(this, 640, 400, 640, 300, 0xc9a8ff));
    pop.add(this.add.text(640, 305, '✨ New area', textStyle(44, '#c9a8ff')).setOrigin(0.5));
    pop.add(this.add.text(640, 385, 'Coming soon!\nNew levels, enemies and a new boss are on the way.',
      { ...textStyle(26), align: 'center' }).setOrigin(0.5));
    pop.add(makeButton(this, 640, 495, 200, 50, 'OK', () => {
      pop.setVisible(false);
      this.time.delayedCall(1, () => pop.destroy());
    }, { fontSize: 26 }));
  }

  openLevel(id) {
    const level = LEVELS.find((l) => l.id === id);
    const pop = this.add.container(0, 0).setDepth(200);
    pop.add(this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6).setOrigin(0).setInteractive());
    pop.add(panel(this, 640, 380, 640, 400));
    pop.add(this.add.text(640, 225, level.name, textStyle(40, '#ffd93b')).setOrigin(0.5));
    const kind = level.maze ? 'Maze level  -  ' : '';
    pop.add(this.add.text(640, 275, `${kind}${level.waves.length} waves   -   Best: ${starText(this.stars(id))}`,
      textStyle(24, '#c9d3ff')).setOrigin(0.5));
    pop.add(this.add.text(640, 318, 'Choose difficulty', textStyle(28)).setOrigin(0.5));

    Object.entries(DIFFICULTY).forEach(([key, d], i) => {
      const x = 440 + i * 200;
      const b = makeButton(this, x, 400, 180, 80, d.label, () => this.start(id, key), { color: d.color, fontSize: 32 });
      pop.add([b, this.add.text(x, 465, starText(d.stars), textStyle(24, '#ffd93b')).setOrigin(0.5)]);
    });
    pop.add(makeButton(this, 640, 535, 200, 50, 'Cancel', () => {
      pop.setVisible(false);
      this.time.delayedCall(1, () => pop.destroy());
    }, { fontSize: 24, color: 0x3a4470 }));
  }

  // Plays the story scene for this level first, the first time only
  start(id, difficulty) {
    const game = { scene: 'Game', data: { levelId: id, difficulty, mapIndex: this.mapIndex } };
    const story = storyBefore(id);
    if (story && !this.player.seenStory.includes(story)) this.scene.start('Story', { id: story, next: game });
    else this.scene.start(game.scene, game.data);
  }
}
