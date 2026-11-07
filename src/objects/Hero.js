import { HEROES, ABILITIES, heroPower, heroMaxHp, learnedSkills } from '../data/hero.js';
import { gearBonus } from '../data/shop.js';
import { Audio } from '../systems/Audio.js';
import { distToSegment } from '../systems/Path.js';
import { textStyle } from '../ui/theme.js';

// The hero in battle: tap to move, auto-attacks when standing still, blocks enemies,
// has 4 abilities, and respawns at the base after being defeated.
export default class Hero {
  constructor(scene, x, y, saved, heroId = 'zenko') {
    this.scene = scene;
    this.id = HEROES[heroId] ? heroId : 'zenko';
    this.def = HEROES[this.id];
    this.B = this.def.base;
    this.A = ABILITIES;
    this.mods = this.def.mods ?? {};
    this.gear = gearBonus(saved.gear);
    this.level = saved.level;
    this.skills = new Set(learnedSkills(saved));
    this.x = x;
    this.y = y;
    this.spawn = { x, y };
    this.target = null;
    this.alive = true;
    this.hp = this.maxHp;
    this.attackTimer = 0;
    this.powerTime = 0;
    this.sinceHit = 99;
    this.respawnTimer = 0;
    this.channel = null;
    this.cd = { kaiWave: 0, flashStep: 0, powerUp: 0, spiritOrb: 0 };

    this.ring = scene.add.ellipse(x, y + 16, 48, 16).setStrokeStyle(3, this.def.look.gi).setDepth(18);
    this.aura = scene.add.ellipse(x, y - 14, 62, 86, 0xffd93b, 0).setDepth(21);
    this.sprite = scene.add.image(x, y - 14, this.tex(0)).setDepth(22);
    this.hpBar = scene.add.graphics().setDepth(23);
    this.label = scene.add.text(x, y - 62, `Lv ${this.level}`, textStyle(15, '#ffd93b')).setOrigin(0.5).setDepth(23);
    this.marker = scene.add.circle(0, 0, 10).setStrokeStyle(3, 0xffffff).setDepth(5).setVisible(false);
    this.draw();
  }

  tex(form) {
    return `hero_${this.id}_${form}`;
  }

  mod(key, stat) {
    return this.mods[key]?.[stat] ?? 1;
  }

  has(id) {
    return this.skills.has(id);
  }

  get maxHp() {
    return Math.round(heroMaxHp(this.level, this.B.hp) * (1 + this.gear.hp));
  }

  get damage() {
    let d = this.B.damage * heroPower(this.level) * (1 + this.gear.damage);
    if (this.has('heavyFists')) d *= 1.2;
    if (this.powerTime > 0) d *= 1.6;
    if (this.has('rage') && this.hp < this.maxHp / 2) d *= 1.4;
    return d * this.scene.boostAt(this);
  }

  get attackCooldown() {
    let c = this.B.cooldown;
    if (this.has('fastStrikes')) c /= 1.25;
    if (this.powerTime > 0) c /= 1.5;
    return c / (1 + this.gear.attackSpeed) / this.scene.hasteAt(this);
  }

  get speed() {
    let s = this.B.speed;
    if (this.has('quickFeet')) s *= 1.25;
    if (this.powerTime > 0) s *= 1.4;
    return s * (1 + this.gear.speed);
  }

  abilityCooldown(key) {
    let c = this.A[key].cooldown;
    if (key === 'flashStep' && this.has('flashStepPlus')) c *= 0.6;
    if (key === 'spiritOrb' && this.has('spiritOrbPlus')) c *= 0.75;
    if (this.has('cooldownMaster')) c *= 0.8;
    return c * this.mod(key, 'cooldown') * (1 - this.gear.cooldown);
  }

  // Ability damage grows with the hero level, gear, the hero's own strengths (and Power Up / Oru's aura)
  abilityDamage(base, key) {
    return Math.round(base * heroPower(this.level) * (1 + this.gear.damage) * this.mod(key, 'damage')
      * (this.powerTime > 0 ? 1.6 : 1) * this.scene.boostAt(this));
  }

  get canBlock() {
    return this.alive && !this.target && !this.channel;
  }

  moveTo(x, y) {
    if (!this.alive || this.channel) return;
    this.target = { x: Phaser.Math.Clamp(x, 20, 1260), y: Phaser.Math.Clamp(y, 80, 700) };
    this.marker.setPosition(this.target.x, this.target.y).setVisible(true).setAlpha(1).setScale(1);
    this.scene.tweens.killTweensOf(this.marker);
    this.scene.tweens.add({ targets: this.marker, scale: 0.4, alpha: 0.4, duration: 400, yoyo: true, repeat: -1 });
  }

  // Up to maxBlock enemies touching a standing Zenko stop and fight him
  updateBlocking(enemies) {
    for (const e of enemies) e.blocked = false;
    if (!this.canBlock) return;
    enemies
      .filter((e) => e.alive && !e.flying && Math.hypot(e.x - this.x, e.y - this.y) <= this.B.blockRadius)
      .sort((a, b) => b.dist - a.dist)
      .slice(0, this.B.maxBlock)
      .forEach((e) => { e.blocked = true; });
  }

  update(dt) {
    for (const k of Object.keys(this.cd)) this.cd[k] = Math.max(0, this.cd[k] - dt);

    if (!this.alive) {
      this.respawnTimer -= dt;
      this.respawnText.setText(`${this.def.name} returns in ${Math.ceil(this.respawnTimer)}`);
      if (this.respawnTimer <= 0) this.respawn();
      return;
    }

    if (this.powerTime > 0) {
      this.powerTime -= dt;
      if (this.powerTime <= 0) {
        this.sprite.setTexture(this.tex(0));
        this.aura.setFillStyle(0xffd93b, 0);
      }
    }

    this.sinceHit += dt;
    if (this.sinceHit > 3 && this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.04 * dt);

    if (this.channel) {
      this.channel.t -= dt;
      if (this.channel.t <= 0) this.releaseOrb();
    } else if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const d = Math.hypot(dx, dy);
      const step = this.speed * dt;
      if (d <= step) {
        this.x = this.target.x;
        this.y = this.target.y;
        this.target = null;
        this.scene.tweens.killTweensOf(this.marker);
        this.marker.setVisible(false);
      } else {
        this.x += (dx / d) * step;
        this.y += (dy / d) * step;
      }
      if (Math.abs(dx) > 1) this.sprite.setFlipX(dx < 0);
    } else {
      this.attack(dt);
    }
    this.draw();
  }

  attack(dt) {
    this.attackTimer -= dt;
    if (this.attackTimer > 0) return;
    const e = this.scene.findNearest(this.x, this.y, this.B.range);
    if (!e) return;
    this.attackTimer = this.attackCooldown;
    this.sprite.setFlipX(e.x < this.x);
    let dmg = this.damage;
    const crit = this.has('critical') && Math.random() < 0.15;
    if (crit) dmg *= 2;
    dmg = Math.round(dmg);
    this.scene.beamFx(this.x, this.y - 18, e.x, e.y - 6, this.powerTime > 0 ? 0xffd93b : 0xff8a3d, 10);
    this.scene.hitSpark(e.x, e.y - 6, 0xffd93b);
    this.scene.damageNumber(e.x, e.y - 20, dmg);
    if (crit) this.scene.floatText(e.x, e.y - 44, 'CRIT!', '#ff6b4a', 20);
    Audio.sfx('hero', 0.08);
    this.hitEnemy(e, dmg);
    // Chain Hit: the blast jumps to one more enemy close by
    if (this.has('chainHit')) {
      const next = this.scene.enemies.find((o) => o !== e && o.alive && Math.hypot(o.x - e.x, o.y - e.y) < 90);
      if (next) {
        this.scene.beamFx(e.x, e.y - 6, next.x, next.y - 6, 0xffd93b, 6);
        this.hitEnemy(next, Math.round(dmg / 2));
      }
    }
  }

  // Damage an enemy. Boss Slayer hits bosses harder; a final blow gives Ki Harvest and bonus XP
  hitEnemy(e, dmg) {
    if (e.def.boss && this.has('bossSlayer')) dmg *= 1.4;
    e.takeDamage(dmg);
    if (!e.alive) {
      this.scene.onHeroKill?.(e);
      if (this.has('kiHarvest')) this.scene.addKi(2, e.x, e.y - 54);
    }
  }

  takeDamage(n) {
    if (!this.alive) return;
    if (this.has('afterimage')) n *= 0.8;
    if (this.sinceHit > 0.5) Audio.sfx('hurt', 0.4);
    this.hp -= n;
    this.sinceHit = 0;
    if (this.hp <= 0) this.die();
  }

  die() {
    this.alive = false;
    this.hp = 0;
    this.target = null;
    this.channel?.orb.destroy();
    this.channel = null;
    this.powerTime = 0;
    this.scene.tweens.killTweensOf(this.marker);
    this.marker.setVisible(false);
    [this.sprite, this.aura, this.ring, this.label, this.hpBar].forEach((o) => o.setVisible(false));
    this.scene.poof(this.x, this.y);
    this.scene.floatText(this.x, this.y - 50, `${this.def.name} is down!`, '#ff6b6b', 26);
    this.respawnTimer = this.B.respawn * (this.has('quickReturn') ? 0.5 : 1);
    this.respawnText = this.scene.add.text(this.spawn.x, this.spawn.y - 40, '', textStyle(20, '#ffb3b3'))
      .setOrigin(0.5).setDepth(40);
  }

  respawn() {
    this.alive = true;
    this.x = this.spawn.x;
    this.y = this.spawn.y;
    this.hp = this.maxHp;
    this.sprite.setTexture(this.tex(0));
    this.aura.setFillStyle(0xffd93b, 0);
    [this.sprite, this.aura, this.ring, this.label, this.hpBar].forEach((o) => o.setVisible(true));
    this.respawnText.destroy();
    this.respawnText = null;
    this.scene.flashFx(this.x, this.y - 14, 70, 0xd8442b);
    this.draw();
  }

  draw() {
    this.sprite.setPosition(this.x, this.y - 14).setDepth(22 + this.y / 1000);
    this.aura.setPosition(this.x, this.y - 14);
    this.ring.setPosition(this.x, this.y + 16);
    this.label.setPosition(this.x, this.y - 62);
    const g = this.hpBar;
    g.clear();
    const w = 44;
    const x = this.x - w / 2;
    const y = this.y - 52;
    const r = Math.max(0, this.hp / this.maxHp);
    g.fillStyle(0x000000, 0.75).fillRect(x - 1, y - 1, w + 2, 8);
    g.fillStyle(r > 0.5 ? 0x3fd0f5 : r > 0.25 ? 0xffc93b : 0xff4b4b).fillRect(x, y, w * r, 6);
  }

  // ---------- Abilities ----------

  canUse(key) {
    return this.alive && !this.channel && this.cd[key] <= 0;
  }

  cast(key, x, y) {
    if (!this.canUse(key)) return;
    Audio.sfx('ability', 0.2);
    if (key === 'kaiWave') this.kaiWave(x, y);
    else if (key === 'flashStep') this.flashStep(x, y);
    else if (key === 'powerUp') this.powerUp();
    else if (key === 'spiritOrb') this.spiritOrb(x, y);
  }

  kaiWave(tx, ty) {
    const a = this.A.kaiWave;
    this.cd.kaiWave = this.abilityCooldown('kaiWave');
    const plus = this.has('kaiWavePlus');
    const width = plus ? 56 : a.width;
    const dmg = this.abilityDamage(a.damage * (plus ? 1.6 : 1), 'kaiWave');
    const sx = this.x;
    const sy = this.y - 18;
    const ang = Math.atan2(ty - sy, tx - sx);
    const ex = sx + Math.cos(ang) * a.length;
    const ey = sy + Math.sin(ang) * a.length;
    this.sprite.setFlipX(tx < this.x);
    this.scene.beamFx(sx, sy, ex, ey, a.color, width * 1.4);
    this.scene.cameras.main.shake(140, 0.005);
    this.scene.floatText(this.x, this.y - 80, 'KAI WAVE!', '#ff8a3d', 28);
    for (const e of [...this.scene.enemies]) {
      if (e.alive && distToSegment(e.x, e.y, sx, sy, ex, ey) < width) {
        this.scene.damageNumber(e.x, e.y - 20, dmg);
        this.hitEnemy(e, dmg);
      }
    }
  }

  flashStep(tx, ty) {
    const a = this.A.flashStep;
    this.cd.flashStep = this.abilityCooldown('flashStep');
    this.scene.flashFx(this.x, this.y - 14, 50, a.color);
    this.target = null;
    this.scene.tweens.killTweensOf(this.marker);
    this.marker.setVisible(false);
    this.x = Phaser.Math.Clamp(tx, 20, 1260);
    this.y = Phaser.Math.Clamp(ty, 80, 700);
    this.scene.flashFx(this.x, this.y - 14, a.radius, a.color);
    const dmg = this.abilityDamage(a.damage * (this.has('flashStepPlus') ? 2 : 1), 'flashStep');
    for (const e of [...this.scene.enemies]) {
      if (e.alive && Math.hypot(e.x - this.x, e.y - this.y) <= a.radius) {
        this.scene.damageNumber(e.x, e.y - 20, dmg);
        this.hitEnemy(e, dmg);
      }
    }
    this.draw();
  }

  powerUp() {
    const a = this.A.powerUp;
    this.cd.powerUp = this.abilityCooldown('powerUp');
    this.powerTime = a.duration * this.mod('powerUp', 'duration');
    this.sprite.setTexture(this.tex(1));
    this.aura.setFillStyle(0xffd93b, 0.35);
    this.scene.flashFx(this.x, this.y - 14, 90, 0xffd93b);
    this.scene.floatText(this.x, this.y - 80, 'POWER UP!', '#ffd93b', 28);
  }

  spiritOrb(tx, ty) {
    const a = this.A.spiritOrb;
    this.cd.spiritOrb = this.abilityCooldown('spiritOrb');
    this.target = null;
    this.scene.tweens.killTweensOf(this.marker);
    this.marker.setVisible(false);
    const orb = this.scene.add.circle(this.x, this.y - 70, 10, a.color, 0.9).setStrokeStyle(4, 0xffffff).setDepth(35);
    this.scene.tweens.add({ targets: orb, scale: 2.8, duration: a.charge * 1000 });
    this.channel = { t: a.charge, tx, ty, orb };
    this.scene.floatText(this.x, this.y - 110, 'SPIRIT ORB!', '#9fe8ff', 28);
  }

  releaseOrb() {
    const a = this.A.spiritOrb;
    const { tx, ty, orb } = this.channel;
    this.channel = null;
    orb.destroy();
    const plus = this.has('spiritOrbPlus');
    this.scene.fireBlast(this.x, this.y - 70, { x: tx, y: ty, alive: false }, {
      damage: this.abilityDamage(a.damage * (plus ? 1.5 : 1), 'spiritOrb'),
      splash: a.radius * (plus ? 1.3 : 1),
      color: a.color,
      size: 28,
      speed: 650,
      big: true,
    });
  }
}
