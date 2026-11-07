import { ENEMIES } from '../data/enemies.js';
import { Audio } from '../systems/Audio.js';

export default class Enemy {
  // `from` = an enemy this one comes out of (a split or a boss summon), `back` = how far behind it
  constructor(scene, type, hpScale = 1, from = null, back = 0) {
    this.scene = scene;
    this.type = type;
    this.def = ENEMIES[type];
    this.hpScale = hpScale;
    this.maxHp = Math.round(this.def.hp * hpScale);
    this.hp = this.maxHp;
    this.alive = true;
    this.reachedEnd = false;
    this.flying = !!this.def.flying;
    this.bob = Math.random() * Math.PI * 2;
    // Status effects (in seconds)
    this.slowFactor = 1;
    this.slowTime = 0;
    this.stunTime = 0;
    this.flashTime = 0;
    this.speedMul = 1;
    this.healTimer = this.def.heal?.every ?? 0;
    this.shield = 0;
    this.shieldTime = 0;

    // Flyers cross maze levels in a straight line; on road levels they follow the road
    this.route = this.flying ? scene.airRoute : scene.route;
    if (from) this.route.place(this, from, back);
    else this.route.spawn(this);
    this.lift = this.flying ? 26 : 0;
    if (this.flying) this.shadow = scene.add.ellipse(this.x, this.y + 8, 30, 9, 0x000000, 0.25).setDepth(9);
    this.sprite = scene.add.image(this.x, this.y - this.lift, this.def.texture).setDepth(this.flying ? 26 : 10);
    this.hpBar = scene.add.graphics().setDepth(this.flying ? 27 : 12);

    if (this.def.boss) {
      this.skills = { ...this.def.skills, ...(scene.diffKey === 'hard' ? this.def.hardSkills : {}) };
      // Start each skill timer part-way, so the boss doesn't use everything at once
      this.skillTimers = {};
      Object.entries(this.skills).forEach(([k, s], i) => { this.skillTimers[k] = (s.every ?? 0) * 0.5 + i * 1.5; });
      this.shieldGfx = scene.add.circle(this.x, this.y, 52, 0x7fd8ff, 0.25).setStrokeStyle(3, 0xbff0ff).setDepth(13).setVisible(false);
    }
  }

  update(dt) {
    this.flashTime -= dt;
    if (this.def.heal) this.healTick(dt);
    if (this.def.boss) this.bossTick(dt);
    if (this.stunTime > 0) {
      this.stunTime -= dt;
      this.applyTint();
      return;
    }
    if (this.blocked && this.scene.hero) {
      // Stopped by Zenko: fight him instead of walking
      this.scene.hero.takeDamage(this.def.dps * dt);
      this.bob += dt * 12;
      this.sprite.setPosition(this.x + Math.sin(this.bob) * 2, this.y);
      this.sprite.setFlipX(this.scene.hero.x < this.x);
      this.applyTint();
      this.drawHpBar();
      this.drawShield();
      return;
    }
    let speed = this.def.speed * this.speedMul;
    if (this.slowTime > 0) {
      this.slowTime -= dt;
      speed *= this.slowFactor;
    }
    const dx = this.route.move(this, speed * dt);
    if (dx === 'done') {
      this.reachedEnd = true;
      this.destroy();
      return;
    }
    this.bob += dt * speed * 0.15;
    const bobH = this.flying ? 5 : 2;
    this.sprite.setPosition(this.x, this.y - this.lift + Math.sin(this.bob) * bobH);
    if (!this.flying) this.sprite.setDepth(10 + this.y / 1000);
    this.shadow?.setPosition(this.x, this.y + 8);
    if (dx !== 0) this.sprite.setFlipX(dx < 0);
    this.applyTint();
    this.drawHpBar();
    this.drawShield();
  }

  // Medic: every few seconds, heals enemies around it (itself included)
  healTick(dt) {
    const h = this.def.heal;
    this.healTimer -= dt;
    if (this.healTimer > 0 || this.stunTime > 0) return;
    this.healTimer = h.every;
    let healed = false;
    for (const e of this.scene.enemies) {
      if (!e.alive || e.hp >= e.maxHp || Math.hypot(e.x - this.x, e.y - this.y) > h.radius) continue;
      e.hp = Math.min(e.maxHp, e.hp + e.maxHp * h.amount);
      e.drawHpBar();
      healed = true;
    }
    this.scene.healFx(this.x, this.y, h.radius, healed);
  }

  // ---------- Boss skills ----------

  bossTick(dt) {
    const s = this.skills;
    if (s.enrage && !this.enraged && this.hp < this.maxHp / 2) {
      this.enraged = true;
      this.speedMul = s.enrage.speed;
      this.scene.floatText(this.x, this.y - this.def.barOffset - 20, 'ENRAGED!', '#ff5a5a', 30);
      this.scene.cameras.main.shake(200, 0.006);
    }
    if (this.shieldTime > 0) {
      this.shieldTime -= dt;
      if (this.shieldTime <= 0) this.shield = 0;
    }
    if (this.stunTime > 0) return;
    for (const key of Object.keys(this.skillTimers)) {
      const skill = s[key];
      if (!skill.every) continue;
      this.skillTimers[key] -= dt;
      if (this.skillTimers[key] > 0) continue;
      if (this[`skill_${key}`](skill) !== false) this.skillTimers[key] = skill.every;
      else this.skillTimers[key] = 1; // nothing to hit: try again soon
    }
  }

  skill_stomp(s) {
    const scene = this.scene;
    scene.stompFx(this.x, this.y, s.radius);
    for (const f of scene.fighters) {
      if (Math.hypot(f.x - this.x, f.y - this.y) <= s.radius) f.stun(s.stun);
    }
    const h = scene.hero;
    if (h?.alive && Math.hypot(h.x - this.x, h.y - this.y) <= s.radius) h.takeDamage(s.damage);
  }

  skill_stun(s) {
    const scene = this.scene;
    const targets = scene.fighters.filter((f) => f.stunTime <= 0 && Math.hypot(f.x - this.x, f.y - this.y) <= s.range);
    if (!targets.length) return false;
    const f = Phaser.Utils.Array.GetRandom(targets);
    scene.beamFx(this.x, this.y - 30, f.x, f.y - 14, 0xb04cff, 14);
    f.stun(s.time);
    Audio.sfx('stun');
    return true;
  }

  skill_shield(s) {
    this.shield = this.maxHp * s.amount;
    this.shieldTime = s.time;
    this.scene.floatText(this.x, this.y - this.def.barOffset - 20, 'SHIELD!', '#7fd8ff', 28);
  }

  skill_summon(s) {
    const scene = this.scene;
    scene.floatText(this.x, this.y - this.def.barOffset - 20, 'Soldiers, attack!', '#ff9a5a', 24);
    for (let i = 0; i < s.count; i++) {
      scene.spawnFrom(this, s.type, (s.hpScale ?? 1) * scene.diff.hp, 20 + i * 18);
    }
    scene.poof(this.x, this.y);
  }

  drawShield() {
    if (!this.shieldGfx) return;
    const on = this.shield > 0;
    this.shieldGfx.setVisible(on);
    if (on) this.shieldGfx.setPosition(this.sprite.x, this.sprite.y - 6).setAlpha(0.5 + 0.3 * Math.sin(this.bob * 3));
  }

  applyTint() {
    if (this.flashTime > 0) this.sprite.setTintFill(0xffffff);
    else if (this.stunTime > 0) this.sprite.setTint(0x7fd8ff);
    else if (this.slowTime > 0) this.sprite.setTint(0xc4ecff);
    else if (this.enraged) this.sprite.setTint(0xff9a9a);
    else this.sprite.clearTint();
  }

  drawHpBar() {
    const g = this.hpBar;
    g.clear();
    if (this.hp >= this.maxHp && !this.def.boss) return;
    const w = this.def.boss ? 70 : 34;
    const h = this.def.boss ? 7 : 5;
    const x = this.x - w / 2;
    const y = this.y - this.lift - this.def.barOffset;
    const r = Math.max(0, this.hp / this.maxHp);
    g.fillStyle(0x000000, 0.7).fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle(r > 0.5 ? 0x5be35b : r > 0.25 ? 0xffc93b : 0xff4b4b).fillRect(x, y, w * r, h);
  }

  // factor is the speed multiplier: 0.5 = half speed. The strongest slow wins. Bosses feel half of it.
  slow(factor, time) {
    if (this.def.boss) factor = 1 - (1 - factor) * 0.5;
    this.slowFactor = this.slowTime > 0 ? Math.min(this.slowFactor, factor) : factor;
    this.slowTime = Math.max(this.slowTime, time);
  }

  // Bosses can't be stunned
  stun(time) {
    if (this.def.boss) return;
    this.stunTime = Math.max(this.stunTime, time);
  }

  takeDamage(amount, flash = true) {
    if (!this.alive) return;
    if (this.def.armor) amount = Math.max(amount * 0.3, amount - this.def.armor);
    if (this.shield > 0) {
      const soaked = Math.min(this.shield, amount);
      this.shield -= soaked;
      amount -= soaked;
    }
    this.hp -= amount;
    if (flash) this.flashTime = 0.06;
    this.applyTint();
    this.drawHpBar();
    if (this.hp <= 0) {
      this.scene.onEnemyKilled(this);
      this.destroy();
      const split = this.def.splitInto;
      if (split && !this.reachedEnd) {
        for (let i = 0; i < split.count; i++) this.scene.spawnFrom(this, split.type, this.hpScale, i * 14);
      }
    }
  }

  destroy() {
    this.alive = false;
    this.sprite.destroy();
    this.hpBar.destroy();
    this.shadow?.destroy();
    this.shieldGfx?.destroy();
  }
}
