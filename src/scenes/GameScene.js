import { LEVELS } from '../data/levels.js';
import { FIGHTERS } from '../data/fighters.js';
import Path from '../systems/Path.js';
import Enemy from '../objects/Enemy.js';
import Fighter from '../objects/Fighter.js';
import { makeButton } from '../ui/Button.js';
import { COLORS, textStyle } from '../ui/theme.js';

const W = 1280;
const H = 720;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.level = LEVELS[0];
    this.path = new Path(this.level.path);
    this.ki = this.level.startKi;
    this.lives = this.level.lives;
    this.waveIndex = -1;
    this.waveActive = false;
    this.waveTime = 0;
    this.spawnQueue = [];
    this.enemies = [];
    this.fighters = [];
    this.speed = 1;
    this.state = 'playing';
    this.menu = null;
    this.tweens.timeScale = 1;
    this.time.timeScale = 1;

    this.drawMap();
    this.createSpots();
    this.rangeCircle = this.add.graphics().setDepth(6);
    this.createHud();

    // Tapping empty ground closes any open menu
    this.input.on('pointerdown', (pointer, over) => {
      if (over.length === 0) this.closeMenu();
    });
  }

  // ---------- Map ----------

  drawMap() {
    const g = this.add.graphics().setDepth(0);
    const rnd = new Phaser.Math.RandomDataGenerator([`map-${this.level.id}`]);

    g.fillStyle(0x6fb552).fillRect(0, 0, W, H);
    for (let i = 0; i < 140; i++) {
      g.fillStyle(rnd.pick([0x64a84a, 0x7cc25e, 0x5d9e44]), 1);
      g.fillEllipse(rnd.between(0, W), rnd.between(0, H), rnd.between(30, 90), rnd.between(14, 40));
    }

    const pts = this.path.points;
    g.lineStyle(66, 0xa8864f).strokePoints(pts);
    pts.forEach((p) => g.fillStyle(0xa8864f).fillCircle(p.x, p.y, 33));
    g.lineStyle(54, 0xe0c08c).strokePoints(pts);
    pts.forEach((p) => g.fillStyle(0xe0c08c).fillCircle(p.x, p.y, 27));
    for (let i = 0; i < 60; i++) {
      const p = this.path.pointAt(rnd.between(0, this.path.length));
      g.fillStyle(0xc9a66b).fillCircle(p.x + rnd.between(-20, 20), p.y + rnd.between(-20, 20), rnd.between(2, 4));
    }

    for (let i = 0, placed = 0; i < 500 && placed < 34; i++) {
      const x = rnd.between(20, W - 20);
      const y = rnd.between(80, H - 20);
      if (this.path.distanceTo(x, y) < 70) continue;
      if (this.level.spots.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < 60)) continue;
      if (x < 340 && y > 620) continue;
      placed++;
      if (rnd.frac() < 0.6) this.drawTree(g, x, y, rnd);
      else this.drawRock(g, x, y, rnd);
    }

    this.drawPortal(pts[0].x + 60, pts[0].y);
    this.drawBase(pts[pts.length - 1].x, pts[pts.length - 1].y);
  }

  drawTree(g, x, y, rnd) {
    const s = rnd.realInRange(0.8, 1.2);
    g.fillStyle(0x000000, 0.18).fillEllipse(x, y + 14 * s, 40 * s, 10 * s);
    g.fillStyle(0x7a4e2d).fillRect(x - 4 * s, y, 8 * s, 14 * s);
    g.lineStyle(2, COLORS.outline);
    g.fillStyle(0x2f7a3a);
    g.fillCircle(x - 10 * s, y - 4 * s, 13 * s).strokeCircle(x - 10 * s, y - 4 * s, 13 * s);
    g.fillCircle(x + 10 * s, y - 4 * s, 13 * s).strokeCircle(x + 10 * s, y - 4 * s, 13 * s);
    g.fillStyle(0x3b9447).fillCircle(x, y - 14 * s, 15 * s).strokeCircle(x, y - 14 * s, 15 * s);
  }

  drawRock(g, x, y, rnd) {
    const s = rnd.realInRange(0.7, 1.3);
    g.lineStyle(2, COLORS.outline);
    g.fillStyle(0x8c8f99).fillEllipse(x, y, 34 * s, 22 * s).strokeEllipse(x, y, 34 * s, 22 * s);
    g.fillStyle(0xb3b6c0).fillEllipse(x - 5 * s, y - 4 * s, 14 * s, 7 * s);
  }

  drawPortal(x, y) {
    const outer = this.add.ellipse(x, y, 70, 90, 0x6c2f86, 0.85).setDepth(9).setStrokeStyle(4, 0x2a0f3a);
    const inner = this.add.ellipse(x, y, 44, 62, 0xc38be0, 0.9).setDepth(9);
    this.tweens.add({ targets: inner, scaleX: 0.7, scaleY: 0.8, duration: 800, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: outer, angle: 8, duration: 1200, yoyo: true, repeat: -1 });
  }

  drawBase(x, y) {
    const g = this.add.graphics().setDepth(9);
    g.fillStyle(0x000000, 0.2).fillEllipse(x, y + 4, 110, 22);
    g.lineStyle(3, COLORS.outline);
    g.fillStyle(0xf2f4f8);
    g.beginPath();
    g.arc(x, y, 46, Math.PI, 0, false);
    g.closePath();
    g.fillPath();
    g.strokePath();
    g.fillStyle(0x2f55c4).fillRect(x - 46, y - 16, 92, 8).strokeRect(x - 46, y - 16, 92, 8);
    g.fillStyle(0x3b3f4a).fillRoundedRect(x - 12, y - 26, 24, 26, { tl: 10, tr: 10, bl: 0, br: 0 });
    this.add.text(x, y - 62, 'BASE', textStyle(20)).setOrigin(0.5).setDepth(9);
  }

  createSpots() {
    this.spots = this.level.spots.map(([x, y]) => {
      const img = this.add.image(x, y, 'spot').setDepth(4).setInteractive({ useHandCursor: true });
      const spot = { x, y, img, fighter: null };
      img.on('pointerdown', () => {
        if (this.state !== 'playing') return;
        if (spot.fighter) this.selectFighter(spot.fighter);
        else this.openBuildMenu(spot);
      });
      return spot;
    });
  }

  // ---------- HUD ----------

  createHud() {
    this.add.rectangle(0, 0, W, 56, COLORS.panel, 0.85).setOrigin(0).setDepth(100);
    this.add.image(30, 28, 'ki').setDepth(101);
    this.kiText = this.add.text(52, 28, '', textStyle(28, '#ffd93b')).setOrigin(0, 0.5).setDepth(101);
    this.add.text(190, 28, '♥', textStyle(28, '#ff5a5a')).setOrigin(0, 0.5).setDepth(101);
    this.livesText = this.add.text(220, 28, '', textStyle(28)).setOrigin(0, 0.5).setDepth(101);
    this.waveText = this.add.text(340, 28, '', textStyle(28)).setOrigin(0, 0.5).setDepth(101);
    this.add.text(W - 20, 28, `${this.level.map}  -  ${this.level.name}`, textStyle(24, '#c9d3ff'))
      .setOrigin(1, 0.5).setDepth(101);

    this.startBtn = makeButton(this, 120, 672, 200, 56, '', () => this.startWave(), { color: 0xe0661a });
    this.speedBtn = makeButton(this, 272, 672, 84, 56, '1x', () => this.toggleSpeed());
    this.refreshHud();
  }

  refreshHud() {
    this.kiText.setText(`${this.ki}`);
    this.livesText.setText(`${this.lives}`);
    const total = this.level.waves.length;
    this.waveText.setText(`Wave ${Math.max(0, this.waveIndex + 1)}/${total}`);
    if (this.waveActive) {
      this.startBtn.setLabel('Fighting...');
      this.startBtn.setEnabled(false);
    } else {
      this.startBtn.setLabel(`Start wave ${this.waveIndex + 2}`);
      this.startBtn.setEnabled(this.state === 'playing');
    }
  }

  toggleSpeed() {
    this.speed = this.speed === 1 ? 2 : 1;
    this.tweens.timeScale = this.speed;
    this.time.timeScale = this.speed;
    this.speedBtn.setLabel(`${this.speed}x`);
  }

  // ---------- Menus ----------

  closeMenu() {
    this.rangeCircle.clear();
    if (!this.menu) return;
    const m = this.menu;
    this.menu = null;
    m.setVisible(false);
    // Destroy on the next frame, so we never destroy a button inside its own click handler
    this.time.delayedCall(1, () => m.destroy());
  }

  menuPosition(spot, w, h) {
    const x = Phaser.Math.Clamp(spot.x, w / 2 + 10, W - w / 2 - 10);
    let y = spot.y - 50 - h / 2;
    if (y - h / 2 < 64) y = spot.y + 50 + h / 2;
    return { x, y };
  }

  showRange(x, y, range, color) {
    this.rangeCircle.clear();
    this.rangeCircle.fillStyle(color, 0.12).fillCircle(x, y, range);
    this.rangeCircle.lineStyle(2, color, 0.7).strokeCircle(x, y, range);
  }

  openBuildMenu(spot) {
    this.closeMenu();
    const types = Object.keys(FIGHTERS);
    const cardW = 124;
    const cardH = 140;
    const gap = 10;
    const w = types.length * cardW + (types.length - 1) * gap + 20;
    const h = cardH + 20;
    const pos = this.menuPosition(spot, w, h);
    const m = this.add.container(pos.x, pos.y).setDepth(120);
    m.add(this.add.rectangle(0, 0, w, h, COLORS.panel, 0.94).setStrokeStyle(2, COLORS.ki));

    types.forEach((type, i) => {
      const def = FIGHTERS[type];
      const cx = -w / 2 + 10 + cardW / 2 + i * (cardW + gap);
      const afford = this.ki >= def.cost;
      const card = this.add.rectangle(cx, 0, cardW, cardH, COLORS.card)
        .setStrokeStyle(2, afford ? 0xffffff : 0x555a6a)
        .setInteractive({ useHandCursor: true });
      card.on('pointerover', () => this.showRange(spot.x, spot.y, def.levels[0].range, def.color));
      card.on('pointerdown', () => {
        if (this.ki < def.cost) {
          this.floatText(pos.x + cx, pos.y, 'Not enough Ki', '#ff6b6b', 22);
          return;
        }
        this.buildFighter(spot, type);
      });
      m.add([
        card,
        this.add.image(cx, -34, def.texture),
        this.add.text(cx, 10, def.name, textStyle(24)).setOrigin(0.5),
        this.add.text(cx, 34, def.role, textStyle(16, '#c9d3ff')).setOrigin(0.5),
        this.add.text(cx, 56, `${def.cost} Ki`, textStyle(22, afford ? '#ffd93b' : '#ff6b6b')).setOrigin(0.5),
      ]);
      if (i === 0) this.showRange(spot.x, spot.y, def.levels[0].range, def.color);
    });
    this.menu = m;
  }

  selectFighter(f) {
    this.closeMenu();
    this.showRange(f.x, f.y, f.stats.range, f.def.color);

    const w = 290;
    const h = 170;
    const pos = this.menuPosition(f.spot, w, h);
    const m = this.add.container(pos.x, pos.y).setDepth(120);
    m.add(this.add.rectangle(0, 0, w, h, COLORS.panel, 0.94).setStrokeStyle(2, f.def.color));
    m.add(this.add.text(0, -62, `${f.def.name}  ${'★'.repeat(f.level + 1)}`, textStyle(28)).setOrigin(0.5));
    const s = f.stats;
    m.add(this.add.text(0, -28, `Damage ${s.damage}   Range ${s.range}   Speed ${(1 / s.cooldown).toFixed(1)}/s`,
      textStyle(17, '#c9d3ff')).setOrigin(0.5));

    const next = f.nextLevel;
    const upLabel = next ? `Upgrade  ${next.cost} Ki` : 'Max level';
    const up = makeButton(this, 0, 18, 250, 44, upLabel, () => {
      if (!next) return;
      if (this.ki < next.cost) {
        this.floatText(pos.x, pos.y, 'Not enough Ki', '#ff6b6b', 22);
        return;
      }
      this.ki -= next.cost;
      f.upgrade();
      this.refreshHud();
      this.selectFighter(f);
    }, { color: 0x2f8a4a, fontSize: 22 });
    up.setEnabled(!!next && this.ki >= next.cost);

    const refund = Math.floor(f.spent * 0.7);
    const sell = makeButton(this, 0, 64, 250, 36, `Sell  +${refund} Ki`, () => {
      this.ki += refund;
      f.destroy();
      f.spot.fighter = null;
      this.fighters = this.fighters.filter((x) => x !== f);
      this.closeMenu();
      this.refreshHud();
    }, { color: 0x8a2f3a, fontSize: 20 });

    m.add([up, sell]);
    this.menu = m;
  }

  buildFighter(spot, type) {
    this.ki -= FIGHTERS[type].cost;
    const f = new Fighter(this, spot, type);
    spot.fighter = f;
    this.fighters.push(f);
    this.closeMenu();
    this.refreshHud();
  }

  // ---------- Waves ----------

  startWave() {
    if (this.waveActive || this.state !== 'playing') return;
    if (this.waveIndex + 1 >= this.level.waves.length) return;
    this.waveIndex++;
    this.waveActive = true;
    this.waveTime = 0;
    this.spawnQueue = [];
    for (const gr of this.level.waves[this.waveIndex].groups) {
      for (let i = 0; i < gr.count; i++) {
        this.spawnQueue.push({ time: (gr.delay ?? 0) + i * gr.interval, type: gr.type, hpScale: gr.hpScale ?? 1 });
      }
    }
    this.spawnQueue.sort((a, b) => a.time - b.time);
    const last = this.waveIndex === this.level.waves.length - 1;
    this.banner(last ? 'Final wave!' : `Wave ${this.waveIndex + 1}`);
    this.refreshHud();
  }

  endWave() {
    this.waveActive = false;
    if (this.waveIndex === this.level.waves.length - 1) {
      this.endGame(true);
      return;
    }
    const bonus = 20 + this.waveIndex * 10;
    this.ki += bonus;
    this.floatText(W / 2, H / 2 + 50, `Wave clear!  +${bonus} Ki`, '#ffd93b', 34);
    this.refreshHud();
  }

  update(time, delta) {
    if (this.state !== 'playing') return;
    const dt = Math.min(delta / 1000, 0.05) * this.speed;

    if (this.waveActive) {
      this.waveTime += dt;
      while (this.spawnQueue.length && this.spawnQueue[0].time <= this.waveTime) {
        const s = this.spawnQueue.shift();
        this.enemies.push(new Enemy(this, s.type, s.hpScale));
      }
    }

    for (const e of this.enemies) if (e.alive) e.update(dt);
    for (const f of this.fighters) f.update(dt);

    for (const e of this.enemies) if (e.reachedEnd) this.loseLives(e.def.lives);
    this.enemies = this.enemies.filter((e) => e.alive);

    if (this.state === 'playing' && this.waveActive && this.spawnQueue.length === 0 && this.enemies.length === 0) {
      this.endWave();
    }
  }

  findTarget(x, y, range) {
    // Target the enemy closest to the base (furthest along the path)
    let best = null;
    for (const e of this.enemies) {
      if (!e.alive || Math.hypot(e.x - x, e.y - y) > range) continue;
      if (!best || e.dist > best.dist) best = e;
    }
    return best;
  }

  onEnemyKilled(e) {
    this.ki += e.def.reward;
    this.floatText(e.x, e.y - 34, `+${e.def.reward}`, '#ffd93b', 20);
    this.poof(e.x, e.y);
    this.refreshHud();
  }

  loseLives(n) {
    if (this.state !== 'playing') return;
    this.lives = Math.max(0, this.lives - n);
    this.cameras.main.shake(120, 0.004);
    this.refreshHud();
    if (this.lives <= 0) this.endGame(false);
  }

  endGame(win) {
    this.state = 'over';
    this.closeMenu();
    this.refreshHud();
    this.startBtn.setVisible(false);
    this.speedBtn.setVisible(false);
    this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setDepth(200).setInteractive();
    this.add.text(W / 2, H / 2 - 90, win ? 'Victory!' : 'Defeat', textStyle(96, win ? '#ffd93b' : '#ff5a5a'))
      .setOrigin(0.5).setDepth(201);
    let sub = 'The army broke through. Train harder and try again.';
    if (win) {
      const stars = this.lives >= this.level.lives * 0.9 ? 3 : this.lives >= this.level.lives * 0.5 ? 2 : 1;
      this.add.text(W / 2, H / 2, '★'.repeat(stars) + '☆'.repeat(3 - stars), textStyle(64, '#ffd93b'))
        .setOrigin(0.5).setDepth(201);
      sub = `The valley is safe. Lives left: ${this.lives}/${this.level.lives}`;
    }
    this.add.text(W / 2, H / 2 + 60, sub, textStyle(28)).setOrigin(0.5).setDepth(201);
    makeButton(this, W / 2, H / 2 + 140, 240, 60, 'Play again', () => this.scene.restart(),
      { color: 0xe0661a, depth: 202 });
  }

  // ---------- Effects ----------

  hitSpark(x, y, color, scale = 1) {
    const g = this.add.graphics().setDepth(30).setPosition(x, y).setScale(scale);
    g.fillStyle(0xffffff).fillCircle(0, 0, 6);
    g.lineStyle(3, color);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.random();
      g.lineBetween(Math.cos(a) * 7, Math.sin(a) * 7, Math.cos(a) * 15, Math.sin(a) * 15);
    }
    this.tweens.add({ targets: g, scale: scale * 1.6, alpha: 0, duration: 180, onComplete: () => g.destroy() });
  }

  beamFx(x1, y1, x2, y2, color) {
    const g = this.add.graphics().setDepth(30);
    g.lineStyle(16, color, 0.55).lineBetween(x1, y1, x2, y2);
    g.lineStyle(6, 0xffffff, 1).lineBetween(x1, y1, x2, y2);
    g.fillStyle(0xffffff).fillCircle(x1, y1, 9);
    g.fillStyle(color, 0.6).fillCircle(x1, y1, 14);
    this.tweens.add({ targets: g, alpha: 0, duration: 260, onComplete: () => g.destroy() });
  }

  poof(x, y) {
    const c = this.add.circle(x, y, 10, 0xc38be0, 0.7).setDepth(29);
    this.tweens.add({ targets: c, scale: 2.4, alpha: 0, duration: 260, onComplete: () => c.destroy() });
  }

  damageNumber(x, y, n) {
    this.floatText(x + Phaser.Math.Between(-8, 8), y, `${n}`, '#ffffff', 16);
  }

  floatText(x, y, str, color = '#ffffff', size = 20) {
    const t = this.add.text(x, y, str, textStyle(size, color)).setOrigin(0.5).setDepth(150);
    this.tweens.add({ targets: t, y: y - 36, alpha: 0, duration: 800, ease: 'Cubic.Out', onComplete: () => t.destroy() });
  }

  banner(str) {
    const t = this.add.text(W / 2, H / 2 - 40, str, textStyle(72, '#ffd93b')).setOrigin(0.5).setDepth(150).setScale(0.4);
    this.tweens.add({
      targets: t, scale: 1, duration: 300, ease: 'Back.Out',
      onComplete: () => this.tweens.add({ targets: t, alpha: 0, delay: 600, duration: 400, onComplete: () => t.destroy() }),
    });
  }
}
