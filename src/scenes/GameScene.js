import { LEVELS } from '../data/levels.js';
import { FIGHTERS } from '../data/fighters.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { addXp } from '../data/hero.js';
import { Save } from '../systems/Save.js';
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

  create(data = {}) {
    this.startData = data;
    this.level = LEVELS.find((l) => l.id === data.levelId) ?? LEVELS[0];
    this.diffKey = data.difficulty ?? 'normal';
    this.diff = DIFFICULTY[this.diffKey];
    this.kills = 0;
    this.path = new Path(this.level.path);
    this.ki = this.level.startKi;
    this.lives = this.level.lives;
    this.waveIndex = -1;
    this.waveActive = false;
    this.waveTime = 0;
    this.spawnQueue = [];
    this.enemies = [];
    this.fighters = [];
    this.projectiles = [];
    this.hazards = [];
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
    this.add.text(W - 130, 28, `${this.level.name}  (${this.diff.label})`, textStyle(24, '#c9d3ff'))
      .setOrigin(1, 0.5).setDepth(101);
    makeButton(this, W - 60, 28, 100, 42, 'Menu', () => this.pause(), { fontSize: 24, color: 0x3a4470, depth: 102 });

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
      card.on('pointerover', () => this.showRange(spot.x, spot.y, def.tiers[0].range, def.color));
      card.on('pointerdown', () => {
        if (this.ki < def.cost) {
          this.floatText(pos.x + cx, pos.y, 'Not enough Ki', '#ff6b6b', 22);
          return;
        }
        this.buildFighter(spot, type);
      });
      m.add([
        card,
        this.add.image(cx, -34, `${def.texture}_0`),
        this.add.text(cx, 10, def.name, textStyle(22)).setOrigin(0.5),
        this.add.text(cx, 34, def.role, textStyle(16, '#c9d3ff')).setOrigin(0.5),
        this.add.text(cx, 56, `${def.cost} Ki`, textStyle(22, afford ? '#ffd93b' : '#ff6b6b')).setOrigin(0.5),
      ]);
      if (i === 0) this.showRange(spot.x, spot.y, def.tiers[0].range, def.color);
    });
    this.menu = m;
  }

  selectFighter(f) {
    this.closeMenu();
    this.showRange(f.x, f.y, f.stats.range, f.def.color);

    const w = 340;
    const h = 236;
    const pos = this.menuPosition(f.spot, w, h);
    const m = this.add.container(pos.x, pos.y).setDepth(120);
    m.add(this.add.rectangle(0, 0, w, h, COLORS.panel, 0.94).setStrokeStyle(2, f.form > 0 ? f.formInfo.aura : f.def.color));
    m.add(this.add.text(0, -92, `${f.def.name}  ${'★'.repeat(f.formStars)}`, textStyle(28)).setOrigin(0.5));
    m.add(this.add.text(0, -62, f.formInfo.name, textStyle(20, f.formInfo.color)).setOrigin(0.5));
    m.add(this.add.text(0, -36, f.describe(), textStyle(17, '#c9d3ff')).setOrigin(0.5));
    const bonusOn = f.form === 2;
    m.add(this.add.text(0, -12, `${bonusOn ? 'Ascended bonus' : 'Ascended unlocks'}: ${f.def.bonusText}`,
      { ...textStyle(15, bonusOn ? '#5be35b' : '#8a91ad'), wordWrap: { width: w - 24 }, align: 'center' }).setOrigin(0.5));

    const next = f.next;
    const transform = f.nextIsTransform;
    let upLabel = 'Max power';
    if (next) upLabel = transform ? `TRANSFORM!  ${next.cost} Ki` : `Upgrade  ${next.cost} Ki`;
    const up = makeButton(this, 0, 38, 300, 48, upLabel, () => {
      if (!next) return;
      if (this.ki < next.cost) {
        this.floatText(pos.x, pos.y, 'Not enough Ki', '#ff6b6b', 22);
        return;
      }
      this.ki -= next.cost;
      f.upgrade();
      this.refreshHud();
      this.selectFighter(f);
    }, { color: transform ? 0xc99a00 : 0x2f8a4a, fontSize: 24 });
    up.setEnabled(!!next && this.ki >= next.cost);

    const refund = Math.floor(f.spent * 0.7);
    const sell = makeButton(this, 0, 90, 300, 36, `Sell  +${refund} Ki`, () => {
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
        this.enemies.push(new Enemy(this, s.type, s.hpScale * this.diff.hp));
      }
    }

    for (const e of this.enemies) if (e.alive) e.update(dt);
    for (const f of this.fighters) f.update(dt);
    this.updateProjectiles(dt);
    this.updateHazards(dt);

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

  // Master Oru's aura: the strongest nearby Oru boosts damage (they don't stack)
  supportFor(f) {
    let best = null;
    for (const o of this.fighters) {
      if (o === f || o.def.attack !== 'support') continue;
      if (Math.hypot(o.x - f.x, o.y - f.y) > o.stats.range) continue;
      if (!best || o.stats.boost > best.stats.boost) best = o;
    }
    return best;
  }

  boostAt(f) {
    const o = this.supportFor(f);
    return o ? 1 + o.stats.boost : 1;
  }

  hasteAt(f) {
    const o = this.supportFor(f);
    return o && o.stats.haste ? 1 + o.stats.haste : 1;
  }

  addKi(amount, x, y) {
    this.ki += amount;
    this.floatText(x, y, `+${amount} Ki`, '#9bff7a', 20);
    this.refreshHud();
  }

  // ---------- Blaze's ki blasts and burning ground ----------

  fireBlast(x, y, target, opts) {
    const ball = this.add.circle(x, y, 9, opts.color).setStrokeStyle(3, 0xffffff).setDepth(31);
    this.projectiles.push({ ball, target, tx: target.x, ty: target.y, speed: 520, ...opts });
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      if (p.target.alive) {
        p.tx = p.target.x;
        p.ty = p.target.y;
      }
      const dx = p.tx - p.ball.x;
      const dy = p.ty - p.ball.y;
      const d = Math.hypot(dx, dy);
      const step = p.speed * dt;
      if (d <= step) {
        p.done = true;
        this.explode(p);
      } else {
        p.ball.x += (dx / d) * step;
        p.ball.y += (dy / d) * step;
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.done);
  }

  explode(p) {
    p.ball.destroy();
    this.explosionFx(p.tx, p.ty, p.splash, p.color);
    this.damageNumber(p.tx, p.ty - 24, p.damage);
    for (const e of [...this.enemies]) {
      if (e.alive && Math.hypot(e.x - p.tx, e.y - p.ty) <= p.splash) e.takeDamage(p.damage);
    }
    if (p.burn) {
      const r = p.splash * 0.8;
      const g = this.add.graphics().setDepth(3);
      g.fillStyle(0xff5a2a, 0.35).fillCircle(p.tx, p.ty, r);
      g.fillStyle(0xffb347, 0.35).fillCircle(p.tx, p.ty, r * 0.6);
      this.hazards.push({ x: p.tx, y: p.ty, r, dps: p.burn.dps, time: p.burn.time, total: p.burn.time, tick: 0, g });
    }
  }

  updateHazards(dt) {
    for (const h of this.hazards) {
      h.time -= dt;
      h.tick += dt;
      if (h.tick >= 0.25) {
        h.tick -= 0.25;
        for (const e of [...this.enemies]) {
          if (e.alive && Math.hypot(e.x - h.x, e.y - h.y) <= h.r) e.takeDamage(h.dps * 0.25, false);
        }
      }
      h.g.setAlpha(Math.max(0, h.time / h.total));
      if (h.time <= 0) h.g.destroy();
    }
    this.hazards = this.hazards.filter((h) => h.time > 0);
  }

  onEnemyKilled(e) {
    this.kills++;
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

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.closeMenu();
    this.tweens.pauseAll();
    const m = this.add.container(0, 0).setDepth(200);
    m.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setInteractive());
    m.add(this.add.text(W / 2, 190, 'Paused', textStyle(90, '#ffd93b')).setOrigin(0.5));
    m.add(makeButton(this, W / 2, 320, 300, 64, 'Resume', () => {
      this.state = 'playing';
      this.tweens.resumeAll();
      m.setVisible(false);
      this.time.delayedCall(1, () => m.destroy());
    }, { color: 0xe0661a }));
    m.add(makeButton(this, W / 2, 404, 300, 64, 'Restart level', () => this.scene.restart(this.startData)));
    m.add(makeButton(this, W / 2, 488, 300, 64, 'Quit to map', () => this.quitToMap()));
  }

  quitToMap() {
    this.scene.start('LevelSelect', { mapIndex: this.startData.mapIndex });
  }

  // Saves stars and hero XP, and returns what was earned
  saveRewards(win) {
    const xp = this.kills * 2 + (win ? 40 * this.diff.stars : 10);
    const stars = win ? this.diff.stars : 0;
    const result = Save.update((p) => {
      const newBest = stars > (p.stars[this.level.id] || 0);
      if (newBest) p.stars[this.level.id] = stars;
      p.kills += this.kills;
      const gained = addXp(p.hero, xp);
      return { newBest, gained, heroLevel: p.hero.level };
    });
    return { xp, stars, ...(result || { newBest: false, gained: 0 }) };
  }

  endGame(win) {
    this.state = 'over';
    this.closeMenu();
    this.refreshHud();
    this.startBtn.setVisible(false);
    this.speedBtn.setVisible(false);
    const r = this.saveRewards(win);

    this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setDepth(200).setInteractive();
    this.add.text(W / 2, 150, win ? 'Victory!' : 'Defeat', textStyle(96, win ? '#ffd93b' : '#ff5a5a'))
      .setOrigin(0.5).setDepth(201);
    if (win) {
      this.add.text(W / 2, 245, '★'.repeat(r.stars) + '☆'.repeat(3 - r.stars), textStyle(64, '#ffd93b'))
        .setOrigin(0.5).setDepth(201);
      this.add.text(W / 2, 305, `${this.diff.label} cleared${r.newBest ? '  -  New best!' : ''}`, textStyle(28))
        .setOrigin(0.5).setDepth(201);
    } else {
      this.add.text(W / 2, 260, 'The army broke through. Train harder and try again.', textStyle(28))
        .setOrigin(0.5).setDepth(201);
    }
    this.add.text(W / 2, 360, `Zenko +${r.xp} XP   (${this.kills} enemies defeated)`, textStyle(30, '#3fd0f5'))
      .setOrigin(0.5).setDepth(201);
    if (r.gained > 0) {
      const lv = this.add.text(W / 2, 410, `LEVEL UP!  Zenko is now level ${r.heroLevel}`, textStyle(36, '#5be35b'))
        .setOrigin(0.5).setDepth(201);
      this.tweens.add({ targets: lv, scale: 1.1, duration: 400, yoyo: true, repeat: -1 });
    }

    makeButton(this, W / 2 - 150, 520, 260, 64, win ? 'Continue' : 'Back to map', () => this.quitToMap(),
      { color: 0xe0661a, depth: 202 });
    makeButton(this, W / 2 + 150, 520, 260, 64, win ? 'Play again' : 'Try again', () => this.scene.restart(this.startData),
      { depth: 202 });
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

  beamFx(x1, y1, x2, y2, color, width = 22) {
    const g = this.add.graphics().setDepth(30);
    g.lineStyle(width * 0.75, color, 0.55).lineBetween(x1, y1, x2, y2);
    g.lineStyle(width * 0.28, 0xffffff, 1).lineBetween(x1, y1, x2, y2);
    g.fillStyle(0xffffff).fillCircle(x1, y1, width * 0.4);
    g.fillStyle(color, 0.6).fillCircle(x1, y1, width * 0.65);
    this.tweens.add({ targets: g, alpha: 0, duration: 260, onComplete: () => g.destroy() });
  }

  flashFx(x, y, range, color) {
    const ring = this.add.circle(x, y, range, color, 0.28).setStrokeStyle(4, 0xffffff, 0.9).setDepth(29).setScale(0.2);
    this.tweens.add({ targets: ring, scale: 1, alpha: 0, duration: 380, ease: 'Cubic.Out', onComplete: () => ring.destroy() });
    const core = this.add.circle(x, y, 22, 0xffffff, 0.95).setDepth(31);
    this.tweens.add({ targets: core, scale: 1.8, alpha: 0, duration: 220, onComplete: () => core.destroy() });
  }

  explosionFx(x, y, radius, color) {
    const c = this.add.circle(x, y, radius, color, 0.55).setDepth(29).setScale(0.3);
    this.tweens.add({ targets: c, scale: 1, alpha: 0, duration: 300, ease: 'Cubic.Out', onComplete: () => c.destroy() });
    this.hitSpark(x, y, 0xffffff, 1.6);
  }

  transformFx(f) {
    const color = f.formInfo.aura;
    this.cameras.main.shake(180, 0.006);
    this.cameras.main.flash(120, 255, 255, 255);
    for (let i = 0; i < 3; i++) {
      const ring = this.add.circle(f.x, f.y - 14, 30, color, 0.4).setStrokeStyle(4, color).setDepth(32);
      this.tweens.add({
        targets: ring, scale: 4, alpha: 0, delay: i * 120, duration: 600, ease: 'Cubic.Out',
        onComplete: () => ring.destroy(),
      });
    }
    this.tweens.add({ targets: f.sprite, scale: { from: 1.4, to: 1 }, duration: 320, ease: 'Back.Out' });
    this.floatText(f.x, f.y - 70, `${f.formInfo.name.toUpperCase()}!`, f.formInfo.color, 34);
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
