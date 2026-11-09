import { FIGHTERS, FORMS, EXP_TOTAL } from '../data/fighters.js';
import { distToSegment } from '../systems/Path.js';
import { textStyle } from '../ui/theme.js';
import { Audio } from '../systems/Audio.js';

export default class Fighter {
  constructor(scene, spot, type) {
    this.scene = scene;
    this.spot = spot;
    this.type = type;
    this.def = FIGHTERS[type];
    this.x = spot.x;
    this.y = spot.y;
    this.tier = 0;
    this.spent = this.def.cost;
    this.cooldown = 0;
    this.hits = 0;
    this.kiTimer = 0;
    this.stunTime = 0;
    this.exp = 0;

    this.aura = scene.add.ellipse(this.x, this.y - 14, 60, 82, 0xffffff, 0).setDepth(19);
    this.sprite = scene.add.image(this.x, this.y - 14, this.textureKey()).setDepth(20 + this.y / 1000);
    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.on('pointerdown', () => scene.state === 'playing' && !scene.aiming && scene.selectFighter(this));
    this.stars = scene.add.text(this.x, this.y + 30, '', textStyle(16)).setOrigin(0.5).setDepth(21);
    this.refreshStars();
    // EXP bar under the fighter, and an arrow over its head when the next upgrade is open
    this.expBar = scene.add.graphics().setDepth(21);
    this.readyIcon = scene.add.text(this.x, this.y - 60, '▲', textStyle(22, '#5be35b')).setOrigin(0.5).setDepth(22).setVisible(false);
    scene.tweens.add({ targets: this.readyIcon, y: this.y - 66, duration: 400, yoyo: true, repeat: -1 });
    this.drawExp();

    this.sprite.setScale(0);
    scene.tweens.add({ targets: this.sprite, scale: 1, duration: 250, ease: 'Back.Out' });
    scene.tweens.add({ targets: this.sprite, scaleY: 1.04, duration: 700, yoyo: true, repeat: -1, delay: 260 });
  }

  get stats() {
    return this.def.tiers[this.tier];
  }

  // The next step, if the story has opened its form (see FORM_LEVELS)
  get next() {
    const n = this.def.tiers[this.tier + 1];
    return n && n.form <= this.scene.maxForm ? n : undefined;
  }

  // The next form is still closed by the story: returns its number
  get closedForm() {
    const n = this.def.tiers[this.tier + 1];
    return n && n.form > this.scene.maxForm ? n.form : null;
  }

  get form() {
    return this.stats.form;
  }

  get formInfo() {
    return FORMS[this.form];
  }

  // Total EXP needed for the next step (undefined at max power)
  get expNeed() {
    return this.next ? EXP_TOTAL[this.tier + 1] : undefined;
  }

  // The next upgrade is open once the fighter has enough EXP
  get expReady() {
    return !!this.next && this.exp >= this.expNeed;
  }

  gainExp(n) {
    if (!this.next) return;
    const was = this.expReady;
    this.exp += n;
    this.drawExp();
    if (!was && this.expReady) {
      this.scene.floatText(this.x, this.y - 74, 'LEVEL UP!', '#5be35b', 22);
      if (this.scene.menuFighter === this && this.scene.menu) this.scene.selectFighter(this);
    }
  }

  drawExp() {
    const g = this.expBar;
    const from = EXP_TOTAL[this.tier];
    const frac = this.next ? Math.min(1, (this.exp - from) / (this.expNeed - from)) : 1;
    g.clear();
    g.fillStyle(0x000000, 0.7).fillRect(this.x - 20, this.y + 40, 40, 5);
    g.fillStyle(this.expReady ? 0x5be35b : this.next ? 0x7fd8ff : 0xffd93b).fillRect(this.x - 20, this.y + 40, 40 * frac, 5);
  }

  // Green arrow: the upgrade is open and there is enough Ki. White: open, but more Ki is needed.
  refreshReady() {
    const show = this.expReady;
    if (this.readyIcon.visible !== show) this.readyIcon.setVisible(show);
    if (show) {
      const color = this.scene.ki >= this.next.cost ? '#5be35b' : '#ffffff';
      if (this.readyIcon.style.color !== color) this.readyIcon.setColor(color);
    }
  }

  get nextIsTransform() {
    return !!this.next && this.next.form !== this.form;
  }

  // Stars inside the current form (1 to 3)
  get formStars() {
    return this.def.tiers.slice(0, this.tier + 1).filter((t) => t.form === this.form).length;
  }

  textureKey() {
    return `${this.def.texture}_${this.form}`;
  }

  refreshStars() {
    this.stars.setText('★'.repeat(this.formStars)).setColor(this.formInfo.color);
  }

  upgrade() {
    const next = this.next;
    if (!next) return;
    const transform = this.nextIsTransform;
    this.tier++;
    this.spent += next.cost;
    this.refreshStars();
    this.drawExp();
    this.refreshReady();
    if (transform) {
      this.scene.tweens.killTweensOf(this.sprite);
      this.sprite.setTexture(this.textureKey()).setScale(1).setPosition(this.x, this.y - 14);
      this.scene.tweens.add({ targets: this.sprite, scaleY: 1.04, duration: 700, yoyo: true, repeat: -1, delay: 330 });
      this.aura.setFillStyle(this.formInfo.aura, 0.22 + this.form * 0.05);
      if (!this.auraTween) {
        this.auraTween = this.scene.tweens.add({ targets: this.aura, scaleX: 1.15, scaleY: 1.1, duration: 450, yoyo: true, repeat: -1 });
      }
      this.scene.transformFx(this);
    } else {
      this.scene.hitSpark(this.x, this.y - 14, this.def.color, 2);
    }
  }

  // A short line describing the current stats, for the upgrade panel
  describe() {
    const s = this.stats;
    const spd = (1 / (s.cooldown ?? 1)).toFixed(1);
    switch (this.def.attack) {
      case 'blast': return `Damage ${s.damage}   Splash ${s.splash}   Range ${s.range}`;
      case 'flash': return `Slow ${Math.round((1 - s.slow) * 100)}%   Damage ${s.damage}   Range ${s.range}`;
      case 'support': return `Boost +${Math.round(s.boost * 100)}%   Ki +${s.ki} / ${s.kiEvery}s   Range ${s.range}`;
      default: return `Damage ${s.damage}   Range ${s.range}   Speed ${spd}/s`;
    }
  }

  // Stunned by a boss: does nothing until it wears off
  stun(time) {
    this.stunTime = Math.max(this.stunTime, time);
    this.sprite.setTint(0x7fd8ff);
    this.scene.floatText(this.x, this.y - 56, 'STUNNED', '#7fd8ff', 20);
  }

  update(dt) {
    this.refreshReady();
    if (this.stunTime > 0) {
      this.stunTime -= dt;
      if (this.stunTime <= 0) this.sprite.clearTint();
      return;
    }
    if (this.def.attack === 'support') {
      this.supportTick(dt);
      return;
    }
    this.cooldown -= dt * this.scene.hasteAt(this);
    if (this.cooldown > 0) return;

    const s = this.stats;
    const damage = Math.round(s.damage * this.scene.boostAt(this));
    if (this.def.attack === 'flash') {
      if (!this.scene.findTarget(this.x, this.y, s.range, this.def.hitsAir)) return;
      this.cooldown = s.cooldown;
      Audio.sfx('flash', 0.1);
      this.flash(damage);
      return;
    }

    const target = this.scene.findTarget(this.x, this.y, s.range, this.def.hitsAir);
    if (!target) return;
    this.sprite.setFlipX(target.x < this.x);
    this.cooldown = s.cooldown;
    Audio.sfx(this.def.attack, 0.07);
    if (this.def.attack === 'punch') this.punch(target, damage);
    else if (this.def.attack === 'beam') this.beam(target, damage);
    else if (this.def.attack === 'blast') this.blast(target, damage);
  }

  punch(target, damage) {
    const dir = Math.sign(target.x - this.x) || 1;
    this.scene.tweens.add({ targets: this.sprite, x: this.x + dir * 8, duration: 60, yoyo: true });
    this.scene.hitSpark(target.x, target.y - 6, this.def.color);
    this.scene.damageNumber(target.x, target.y - 20, damage);
    this.hits++;
    if (this.stats.stunEvery && this.hits % this.stats.stunEvery === 0) {
      target.stun(this.stats.stun);
      this.scene.floatText(target.x, target.y - 40, 'STUN!', '#ffd93b', 20);
    }
    target.takeDamage(damage, true, this);
  }

  beam(target, damage) {
    const s = this.stats;
    const sx = this.x;
    const sy = this.y - 18;
    const angle = Math.atan2(target.y - sy, target.x - sx);
    const ex = sx + Math.cos(angle) * s.range;
    const ey = sy + Math.sin(angle) * s.range;
    this.scene.beamFx(sx, sy, ex, ey, this.form > 0 ? this.formInfo.aura : this.def.color, s.width);
    // The beam pierces: every enemy close to the line gets hit
    for (const e of [...this.scene.enemies]) {
      if (e.alive && distToSegment(e.x, e.y, sx, sy, ex, ey) < s.width) {
        const dmg = e.def.flying && s.flyingBonus ? damage * s.flyingBonus : damage;
        this.scene.damageNumber(e.x, e.y - 20, dmg);
        e.takeDamage(dmg, true, this);
      }
    }
  }

  blast(target, damage) {
    const s = this.stats;
    this.scene.tweens.add({ targets: this.sprite, y: this.y - 20, duration: 70, yoyo: true });
    this.scene.fireBlast(this.x, this.y - 22, target, {
      damage, splash: s.splash, burn: s.burn, color: this.form > 0 ? this.formInfo.aura : this.def.color, by: this,
    });
  }

  flash(damage) {
    const s = this.stats;
    this.scene.flashFx(this.x, this.y - 14, s.range, this.form > 0 ? this.formInfo.aura : this.def.color);
    for (const e of [...this.scene.enemies]) {
      if (!e.alive || (e.flying && !this.def.hitsAir) || Math.hypot(e.x - this.x, e.y - this.y) > s.range) continue;
      e.slow(s.slow, s.slowTime);
      if (s.freeze) e.stun(s.freeze);
      e.takeDamage(damage, true, this);
    }
  }

  supportTick(dt) {
    if (!this.scene.waveActive) return;
    this.kiTimer += dt;
    if (this.kiTimer >= this.stats.kiEvery) {
      this.kiTimer -= this.stats.kiEvery;
      this.scene.addKi(this.stats.ki, this.x, this.y - 50);
    }
  }

  destroy() {
    this.scene.tweens.killTweensOf([this.sprite, this.aura]);
    this.sprite.destroy();
    this.aura.destroy();
    this.stars.destroy();
    this.expBar.destroy();
    this.scene.tweens.killTweensOf(this.readyIcon);
    this.readyIcon.destroy();
  }
}
