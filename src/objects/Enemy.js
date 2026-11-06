import { ENEMIES } from '../data/enemies.js';

export default class Enemy {
  constructor(scene, type, hpScale = 1) {
    this.scene = scene;
    this.def = ENEMIES[type];
    this.maxHp = Math.round(this.def.hp * hpScale);
    this.hp = this.maxHp;
    this.dist = 0;
    this.alive = true;
    this.reachedEnd = false;
    this.bob = Math.random() * Math.PI * 2;
    // Status effects (in seconds)
    this.slowFactor = 1;
    this.slowTime = 0;
    this.stunTime = 0;
    this.flashTime = 0;

    const p = scene.path.pointAt(0);
    this.x = p.x;
    this.y = p.y;
    this.sprite = scene.add.image(p.x, p.y, this.def.texture).setDepth(10);
    this.hpBar = scene.add.graphics().setDepth(12);
  }

  update(dt) {
    this.flashTime -= dt;
    if (this.stunTime > 0) {
      this.stunTime -= dt;
      this.applyTint();
      return;
    }
    let speed = this.def.speed;
    if (this.slowTime > 0) {
      this.slowTime -= dt;
      speed *= this.slowFactor;
    }
    this.dist += speed * dt;
    if (this.dist >= this.scene.path.length) {
      this.reachedEnd = true;
      this.destroy();
      return;
    }
    const p = this.scene.path.pointAt(this.dist);
    this.bob += dt * speed * 0.15;
    this.x = p.x;
    this.y = p.y;
    this.sprite.setPosition(p.x, p.y + Math.sin(this.bob) * 2);
    this.sprite.setDepth(10 + p.y / 1000);
    if (p.dx !== 0) this.sprite.setFlipX(p.dx < 0);
    this.applyTint();
    this.drawHpBar();
  }

  applyTint() {
    if (this.flashTime > 0) this.sprite.setTintFill(0xffffff);
    else if (this.stunTime > 0) this.sprite.setTint(0x7fd8ff);
    else if (this.slowTime > 0) this.sprite.setTint(0xc4ecff);
    else this.sprite.clearTint();
  }

  drawHpBar() {
    const g = this.hpBar;
    g.clear();
    if (this.hp >= this.maxHp) return;
    const w = 34;
    const h = 5;
    const x = this.x - w / 2;
    const y = this.y - this.def.barOffset;
    const r = Math.max(0, this.hp / this.maxHp);
    g.fillStyle(0x000000, 0.7).fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle(r > 0.5 ? 0x5be35b : r > 0.25 ? 0xffc93b : 0xff4b4b).fillRect(x, y, w * r, h);
  }

  // factor is the speed multiplier: 0.5 = half speed. The strongest slow wins.
  slow(factor, time) {
    this.slowFactor = this.slowTime > 0 ? Math.min(this.slowFactor, factor) : factor;
    this.slowTime = Math.max(this.slowTime, time);
  }

  stun(time) {
    this.stunTime = Math.max(this.stunTime, time);
  }

  takeDamage(amount, flash = true) {
    if (!this.alive) return;
    this.hp -= amount;
    if (flash) this.flashTime = 0.06;
    this.applyTint();
    this.drawHpBar();
    if (this.hp <= 0) {
      this.scene.onEnemyKilled(this);
      this.destroy();
    }
  }

  destroy() {
    this.alive = false;
    this.sprite.destroy();
    this.hpBar.destroy();
  }
}
