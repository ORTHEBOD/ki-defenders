import { HEROES, ABILITIES, SUPERS, SUPER_NEED, FREE_ABILITY, heroPower, heroMaxHp, learnedSkills, heroForm, formDamage, formHp } from '../data/hero.js';
import { FORMS } from '../data/fighters.js';
import { gearBonus } from '../data/shop.js';
import { heroTexture } from '../art/fighterArt.js';
import { Audio } from '../systems/Audio.js';
import { distToSegment } from '../systems/Path.js';
import { textStyle } from '../ui/theme.js';

// The hero in battle: tap to move, auto-attacks when standing still, blocks enemies,
// has 4 abilities and a super attack, and respawns at the base after being defeated.
export default class Hero {
  constructor(scene, x, y, saved, heroId = 'zenko') {
    this.scene = scene;
    this.id = HEROES[heroId] ? heroId : 'zenko';
    this.def = HEROES[this.id];
    this.B = this.def.base;
    this.A = ABILITIES;
    this.S = SUPERS[this.id];
    this.superPower = 0;
    this.mods = this.def.mods ?? {};
    this.gear = gearBonus(saved.gear);
    this.worn = saved.gear ?? {};
    this.level = saved.level;
    this.skills = new Set(learnedSkills(saved));
    this.form = heroForm(saved);
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
    this.shown = this.form;
    this.pose = '';
    this.posing = 0;
    this.stepT = 0; // the walking clock: one stride per whole number
    this.bob = 0;
    this.boltTimer = 0;

    this.ring = scene.add.ellipse(x, y + 16, 48, 16).setStrokeStyle(3, this.def.look.gi).setDepth(18);
    this.aura = scene.add.image(x, y - 14, 'aura').setOrigin(0.5, 0.58).setDepth(21);
    scene.tweens.add({ targets: this.aura, scaleX: 1.12, scaleY: 1.2, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.sprite = scene.add.image(x, y - 14, this.tex(this.form)).setDepth(22);
    this.hpBar = scene.add.graphics().setDepth(23);
    this.label = scene.add.text(x, y - 62, `Lv ${this.level}`, textStyle(15, '#ffd93b')).setOrigin(0.5).setDepth(23);
    this.marker = scene.add.circle(0, 0, 10).setStrokeStyle(3, 0xffffff).setDepth(5).setVisible(false);
    this.restLook();
    this.draw();
  }

  // The form's look in a pose ('', '_attack' or '_run'), wearing the hero's gear
  tex(form, pose = '') {
    return heroTexture(this.scene, this.id, form, this.def.look, this.worn, pose);
  }

  // The hero's own form (Forms skills), with its aura. Power Up shows one form higher for a while.
  restLook() {
    this.shown = this.form;
    this.stopWalking();
    this.setPose('');
    this.aura.setTint(this.form > 0 ? FORMS[this.form].aura : 0xffd93b).setAlpha(this.form > 0 ? 0.6 : 0);
  }

  // Standing, running or attacking: the hero's picture for that (art/hero_zenko_2_run.png and so on).
  // With no picture for the pose (or no AI pictures at all) it stays the standing one.
  setPose(pose) {
    this.pose = pose;
    this.sprite.setTexture(this.tex(this.shown, pose));
  }

  // Walking: the run and stand pictures take turns, one per stride, and the hero bobs up on every stride,
  // so it steps instead of sliding. A hero with no run picture leans from side to side instead.
  walk(dt) {
    this.stepT += dt * 7 * (this.speed / 170);
    const stride = Math.floor(this.stepT) % 2;
    this.bob = Math.abs(Math.sin(this.stepT * Math.PI)) * 4;
    if (this.posing > 0) return;
    const pose = stride ? '' : '_run';
    if (this.pose !== pose) this.setPose(pose);
    const runPicture = this.scene.textures.exists(`hero_${this.id}_${this.shown}_run`);
    this.sprite.setAngle(runPicture ? 0 : (stride ? 4 : -4));
  }

  stopWalking() {
    this.stepT = 0;
    this.bob = 0;
    this.sprite.setAngle(0);
  }

  // Shows the attack picture for a moment
  attackPose(ms = 240) {
    this.setPose('_attack');
    this.sprite.setAngle(0);
    this.posing = ms / 1000;
  }

  // Super Form 2 and 3 (and Power Up into them): little lightning bolts flicker around the hero
  crackle(dt) {
    const f = FORMS[this.shown];
    if (!f.sparks) return;
    this.boltTimer -= dt;
    if (this.boltTimer > 0) return;
    this.boltTimer = f.longHair ? 0.11 : 0.17;
    const side = Math.random() < 0.5 ? -1 : 1;
    let x = this.x + side * Phaser.Math.Between(12, 24);
    let y = this.y - 14 + Phaser.Math.Between(-30, 22);
    const pts = [{ x, y }];
    for (let k = 0; k < 4; k++) {
      x += side * Phaser.Math.Between(1, 6);
      y += Phaser.Math.Between(-9, 9);
      pts.push({ x, y });
    }
    const g = this.scene.add.graphics().setDepth(this.sprite.depth + 0.01);
    g.lineStyle(4, 0x5ad8ff, 0.45).strokePoints(pts);
    g.lineStyle(1.6, 0xeafcff, 1).strokePoints(pts);
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 170, onComplete: () => g.destroy() });
  }

  mod(key, stat) {
    return this.mods[key]?.[stat] ?? 1;
  }

  has(id) {
    return this.skills.has(id);
  }

  get maxHp() {
    return Math.round(heroMaxHp(this.level, this.B.hp) * (1 + this.gear.hp) * formHp(this.form));
  }

  get damage() {
    let d = this.B.damage * heroPower(this.level) * (1 + this.gear.damage) * formDamage(this.form);
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
    return Math.round(base * heroPower(this.level) * (1 + this.gear.damage) * formDamage(this.form) * this.mod(key, 'damage')
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
      if (this.powerTime <= 0) this.restLook();
    }

    this.sinceHit += dt;
    if (this.sinceHit > 3 && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.04 * (1 + this.gear.regen) * dt);
    }

    this.crackle(dt);
    if (this.posing > 0) {
      this.posing -= dt;
      if (this.posing <= 0) this.setPose(this.target ? this.pose === '_attack' ? '_run' : this.pose : '');
    }

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
        this.stopWalking();
        if (this.posing <= 0) this.setPose('');
      } else {
        this.x += (dx / d) * step;
        this.y += (dy / d) * step;
        this.walk(dt);
      }
      if (Math.abs(dx) > 1) this.sprite.setFlipX(dx < 0);
    } else {
      // Stopped by an ability (Flash Step, Spirit Orb) in the middle of a stride
      if (this.stepT) {
        this.stopWalking();
        if (this.posing <= 0) this.setPose('');
      }
      this.attack(dt);
    }
    this.draw();
  }

  attack(dt) {
    this.attackTimer -= dt;
    if (this.attackTimer > 0) return;
    const e = this.scene.findNearest(this.x, this.y, this.range);
    if (!e) return;
    this.attackTimer = this.attackCooldown;
    this.sprite.setFlipX(e.x < this.x);
    this.attackPose(Math.min(240, this.attackCooldown * 600));
    let dmg = this.damage;
    const crit = this.has('critical') && Math.random() < 0.15;
    if (crit) dmg *= 2;
    dmg = Math.round(dmg);
    this.scene.beamFx(this.x, this.y - 18, e.x, e.y - 6, this.powerTime > 0 ? 0xffd93b : 0xff8a3d, 10);
    this.scene.hitSpark(e.x, e.y - 6, 0xffd93b);
    this.scene.damageNumber(e.x, e.y - 20, dmg);
    if (crit) this.scene.floatText(e.x, e.y - 44, 'CRIT!', '#ff6b4a', 20);
    Audio.sfx('hero', 0.08);
    this.hitEnemy(e, dmg, 'fist');
    // Chain Hit: the blast jumps to one more enemy close by
    if (this.has('chainHit')) {
      const next = this.scene.enemies.find((o) => o !== e && o.alive && Math.hypot(o.x - e.x, o.y - e.y) < 90);
      if (next) {
        this.scene.beamFx(e.x, e.y - 6, next.x, next.y - 6, 0xffd93b, 6);
        this.hitEnemy(next, Math.round(dmg / 2), 'fist');
      }
    }
  }

  // Damage an enemy. Boss Slayer hits bosses harder; a final blow gives Ki Harvest.
  // The hero's XP comes only from enemies it hits by how much damage it does (see GameScene.shareExp).
  hitEnemy(e, dmg, kind = null) {
    if (e.def.boss && this.has('bossSlayer')) dmg *= 1.4;
    e.takeDamage(dmg, true, this, kind);
    if (!e.alive && this.has('kiHarvest')) this.scene.addKi(2, e.x, e.y - 54);
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
    this.restLook();
    [this.sprite, this.aura, this.ring, this.label, this.hpBar].forEach((o) => o.setVisible(true));
    this.respawnText.destroy();
    this.respawnText = null;
    this.scene.flashFx(this.x, this.y - 14, 70, 0xd8442b);
    this.draw();
  }

  draw() {
    this.sprite.setPosition(this.x, this.y - 14 - this.bob).setDepth(22 + this.y / 1000);
    this.ring.setScale(1 - this.bob * 0.03, 1);
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

  get range() {
    return this.B.range * (1 + this.gear.range);
  }

  // Kai Wave is known from the start; the others are learned in the skill tree
  knows(key) {
    return key === FREE_ABILITY || this.has(key);
  }

  canUse(key) {
    if (key === 'super') return this.alive && !this.channel && this.superReady;
    return this.knows(key) && this.alive && !this.channel && this.cd[key] <= 0;
  }

  // An ability's name, color and aiming (the super attack has its own)
  info(key) {
    return key === 'super' ? this.S : this.A[key];
  }

  // ---------- Super attack ----------

  get superReady() {
    return this.superPower >= SUPER_NEED;
  }

  // Fills the super attack button (monsters defeated by anyone count)
  charge(n) {
    const was = this.superReady;
    this.superPower = Math.min(SUPER_NEED, this.superPower + n);
    if (!was && this.superReady) this.scene.floatText(640, 600, `${this.S.name} is ready!`, '#ffd93b', 30, 150);
  }

  superAttack(tx, ty) {
    this.superPower = 0;
    this.target = null;
    this.scene.tweens.killTweensOf(this.marker);
    this.marker.setVisible(false);
    const s = this.S;
    const dmg = this.abilityDamage(s.damage, 'super');
    this.scene.cameras.main.flash(160, 255, 255, 255);
    this.scene.floatText(this.x, this.y - 90, `${s.name.toUpperCase()}!`, '#ffd93b', 34);
    if (this.id === 'mira') this.lightningDash(s, dmg);
    else if (this.id === 'goran') this.earthquake(s, dmg);
    else if (this.id === 'sora') this.skyLightning(s, dmg);
    else this.giantWave(s, dmg, tx, ty);
  }

  // Zenko: a huge Kai Wave across the whole map
  giantWave(s, dmg, tx, ty) {
    const sx = this.x;
    const sy = this.y - 18;
    const ang = Math.atan2(ty - sy, tx - sx);
    const ex = sx + Math.cos(ang) * s.length;
    const ey = sy + Math.sin(ang) * s.length;
    this.sprite.setFlipX(tx < this.x);
    this.attackPose(800);
    for (let i = 0; i < 3; i++) this.scene.time.delayedCall(i * 120, () => this.scene.beamFx(sx, sy, ex, ey, s.color, s.width * (1.6 - i * 0.3)));
    this.scene.cameras.main.shake(450, 0.014);
    for (const e of [...this.scene.enemies]) {
      if (e.alive && distToSegment(e.x, e.y, sx, sy, ex, ey) < s.width) {
        this.scene.damageNumber(e.x, e.y - 20, dmg);
        this.hitEnemy(e, dmg);
      }
    }
  }

  // Mira: zips from monster to monster, hitting each with lightning, then flashes back to where she was
  lightningDash(s, dmg) {
    const home = { x: this.x, y: this.y };
    let x = this.x;
    let y = this.y;
    const left = this.scene.enemies.filter((e) => e.alive);
    const hops = [];
    while (hops.length < s.hits && left.length) {
      left.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
      const e = left.shift();
      hops.push(e);
      x = e.x;
      y = e.y;
    }
    this.scene.flashFx(this.x, this.y - 14, 60, s.color);
    hops.forEach((e, i) => this.scene.time.delayedCall(i * 70, () => {
      if (!this.alive) return;
      this.bolt(this.x, this.y - 14, e.x, e.y - 14, s.color);
      this.x = Phaser.Math.Clamp(e.x, 20, 1260);
      this.y = Phaser.Math.Clamp(e.y, 80, 700);
      this.scene.hitSpark(this.x, this.y - 14, s.color, 1.4);
      if (e.alive) {
        this.scene.damageNumber(e.x, e.y - 20, dmg);
        this.hitEnemy(e, dmg);
      }
      this.draw();
    }));
    this.scene.time.delayedCall(hops.length * 70 + 150, () => {
      if (!this.alive) return;
      this.bolt(this.x, this.y - 14, home.x, home.y - 14, s.color);
      this.x = home.x;
      this.y = home.y;
      this.scene.flashFx(this.x, this.y - 14, 60, s.color);
      this.draw();
    });
    this.attackPose(hops.length * 70 + 200);
  }

  // Goran: the ground shakes around him, hurting and stopping the monsters for a while
  earthquake(s, dmg) {
    this.attackPose(600);
    this.scene.cameras.main.shake(700, 0.02);
    for (let i = 0; i < 3; i++) this.scene.time.delayedCall(i * 150, () => this.scene.flashFx(this.x, this.y + 10, s.radius * (0.6 + i * 0.2), s.color));
    for (const e of [...this.scene.enemies]) {
      if (!e.alive || Math.hypot(e.x - this.x, e.y - this.y) > s.radius) continue;
      this.scene.damageNumber(e.x, e.y - 20, dmg);
      this.hitEnemy(e, dmg);
      if (e.alive && !e.flying) e.stunTime = Math.max(e.stunTime, e.def.boss ? s.stun / 2 : s.stun);
    }
  }

  // Sora: lightning falls from the sky on monsters all over the map, bosses first
  skyLightning(s, dmg) {
    this.attackPose(700);
    const alive = Phaser.Utils.Array.Shuffle(this.scene.enemies.filter((e) => e.alive));
    alive.sort((a, b) => (b.def.boss ? 1 : 0) - (a.def.boss ? 1 : 0));
    alive.slice(0, s.hits).forEach((e, i) => this.scene.time.delayedCall(i * 80, () => {
      if (!e.alive) return;
      this.bolt(e.x + Phaser.Math.Between(-40, 40), e.y - 520, e.x, e.y - 10, s.color);
      this.scene.explosionFx(e.x, e.y - 10, 46, s.color);
      this.scene.damageNumber(e.x, e.y - 20, dmg);
      this.hitEnemy(e, dmg);
    }));
    this.scene.cameras.main.shake(300 + s.hits * 40, 0.008);
  }

  // A zigzag lightning bolt
  bolt(x1, y1, x2, y2, color) {
    const pts = [{ x: x1, y: y1 }];
    const steps = Math.max(3, Math.round(Math.hypot(x2 - x1, y2 - y1) / 40));
    for (let k = 1; k < steps; k++) {
      const t = k / steps;
      pts.push({ x: x1 + (x2 - x1) * t + Phaser.Math.Between(-14, 14), y: y1 + (y2 - y1) * t + Phaser.Math.Between(-14, 14) });
    }
    pts.push({ x: x2, y: y2 });
    const g = this.scene.add.graphics().setDepth(31);
    g.lineStyle(12, color, 0.35).strokePoints(pts);
    g.lineStyle(4, 0xffffff, 1).strokePoints(pts);
    this.scene.tweens.add({ targets: g, alpha: 0, duration: 260, onComplete: () => g.destroy() });
  }

  cast(key, x, y) {
    if (!this.canUse(key)) return;
    Audio.sfx('ability', 0.2);
    this.scene.abilityUses = (this.scene.abilityUses ?? 0) + 1;
    if (key === 'kaiWave') this.kaiWave(x, y);
    else if (key === 'flashStep') this.flashStep(x, y);
    else if (key === 'powerUp') this.powerUp();
    else if (key === 'spiritOrb') this.spiritOrb(x, y);
    else if (key === 'super') this.superAttack(x, y);
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
    this.attackPose(450);
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
    const up = Math.min(FORMS.length - 1, this.form + 1);
    this.shown = up;
    this.setPose(this.pose === '_attack' ? '' : this.pose);
    this.aura.setTint(FORMS[up].aura).setAlpha(0.9);
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
    this.attackPose(450);
    const plus = this.has('spiritOrbPlus');
    this.scene.fireBlast(this.x, this.y - 70, { x: tx, y: ty, alive: false }, {
      damage: this.abilityDamage(a.damage * (plus ? 1.5 : 1), 'spiritOrb'),
      splash: a.radius * (plus ? 1.3 : 1),
      color: a.color,
      size: 28,
      speed: 650,
      big: true,
      by: this,
    });
  }
}
