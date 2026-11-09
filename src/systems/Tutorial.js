import { textStyle } from '../ui/theme.js';
import { Save } from './Save.js';

// The first-time guide on Level 1: one tip at a time, with an arrow pointing at what to tap.
// Each step ends by itself when the player does the thing (or after a few seconds for plain tips).
export default class Tutorial {
  constructor(scene) {
    this.scene = scene;
    const s = scene;
    const spot = (i) => () => s.spots[i] && !s.spots[i].fighter ? { x: s.spots[i].x, y: s.spots[i].y - 40 } : null;
    const heroName = s.hero?.def.name;
    this.steps = [
      { text: 'Tap a glowing spot next to the road to place a fighter', target: spot(2), done: () => s.fighters.length >= 1 },
      { text: 'Nice! Fighters attack enemies in range. Place one more', target: spot(5), done: () => s.fighters.length >= 2 },
      { text: 'Ready? Press Start wave!', target: () => ({ x: 120, y: 625 }), done: () => s.waveIndex >= 0 },
      { text: 'Enemies walk to your base. Every enemy defeated gives Ki to spend', done: () => s.waveIndex >= 0 && !s.waveActive },
      {
        text: 'Fighters earn EXP by defeating enemies. When the green arrow shows, tap the fighter to upgrade it!',
        target: () => {
          const f = s.fighters.find((x) => x.expReady) ?? s.fighters[0];
          return f ? { x: f.x, y: f.y - 70 } : null;
        },
        done: () => s.fighters.some((f) => f.tier > 0),
      },
      heroName
        ? { text: `Tap the ground to move ${heroName}. Tap Kai Wave, then tap where to blast!`, target: () => ({ x: 640, y: 620 }), time: 7 }
        : { text: 'Win levels to earn coins - and win heroes in the Shop\'s Lucky Spin!', time: 6 },
    ];
    this.index = -1;
    this.box = s.add.container(640, 118).setDepth(140);
    this.bg = s.add.rectangle(0, 0, 100, 50, 0x1a3a5a, 0.95).setStrokeStyle(3, 0x7fd8ff);
    this.text = s.add.text(0, 0, '', { ...textStyle(24), align: 'center', wordWrap: { width: 900 } }).setOrigin(0.5);
    this.box.add([this.bg, this.text]);
    this.arrow = s.add.triangle(0, 0, -16, -22, 16, -22, 0, 4, 0xffd93b).setStrokeStyle(3, 0x10131c).setDepth(141);
    this.next();
  }

  next() {
    this.index++;
    const step = this.steps[this.index];
    if (!step) {
      this.finish();
      return;
    }
    this.timer = step.time ?? 0;
    this.text.setText(`TIP ${this.index + 1}/${this.steps.length}:  ${step.text}`);
    this.bg.setSize(this.text.width + 40, this.text.height + 22);
    this.box.setScale(0.8);
    this.scene.tweens.add({ targets: this.box, scale: 1, duration: 200, ease: 'Back.Out' });
  }

  update(dt) {
    const step = this.steps[this.index];
    if (!step) return;
    if (step.time) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.next();
        return;
      }
    } else if (step.done()) {
      this.next();
      return;
    }
    const t = step.target?.();
    this.arrow.setVisible(!!t);
    if (t) this.arrow.setPosition(t.x, t.y + Math.sin(this.scene.time.now / 150) * 8);
  }

  finish() {
    this.box.destroy();
    this.arrow.destroy();
    this.scene.tutorial = null;
    Save.update((p) => { p.tutorialDone = true; });
  }
}
