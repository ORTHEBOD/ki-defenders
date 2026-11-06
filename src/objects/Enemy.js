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

    const p = scene.path.pointAt(0);
    this.x = p.x;
    this.y = p.y;
    this.sprite = scene.add.image(p.x, p.y, this.def.texture).setDepth(10);
    this.hpBar = scene.add.graphics().setDepth(12);
  }

  update(dt) {
    this.dist += this.def.speed * dt;
    if (this.dist >= this.scene.path.length) {
      this.reachedEnd = true;
      this.destroy();
      return;
    }
    const p = this.scene.path.pointAt(this.dist);
    this.bob += dt * this.def.speed * 0.15;
    this.x = p.x;
    this.y = p.y;
    this.sprite.setPosition(p.x, p.y + Math.sin(this.bob) * 2);
    this.sprite.setDepth(10 + p.y / 1000);
    if (p.dx !== 0) this.sprite.setFlipX(p.dx < 0);
    this.drawHpBar();
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

  takeDamage(amount) {
    if (!this.alive) return;
    this.hp -= amount;
    this.sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(60, () => this.sprite.active && this.sprite.clearTint());
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
