import { FIGHTERS } from '../data/fighters.js';
import { distToSegment } from '../systems/Path.js';
import { textStyle } from '../ui/theme.js';

export default class Fighter {
  constructor(scene, spot, type) {
    this.scene = scene;
    this.spot = spot;
    this.type = type;
    this.def = FIGHTERS[type];
    this.x = spot.x;
    this.y = spot.y;
    this.level = 0;
    this.spent = this.def.cost;
    this.cooldown = 0;

    this.aura = scene.add.ellipse(this.x, this.y - 14, 56, 76, this.def.color, 0).setDepth(19);
    this.sprite = scene.add.image(this.x, this.y - 14, this.def.texture).setDepth(20 + this.y / 1000);
    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.on('pointerdown', () => scene.state === 'playing' && scene.selectFighter(this));
    this.stars = scene.add.text(this.x, this.y + 30, '', textStyle(16, '#ffd93b')).setOrigin(0.5).setDepth(21);
    this.refreshStars();

    this.sprite.setScale(0);
    scene.tweens.add({ targets: this.sprite, scale: 1, duration: 250, ease: 'Back.Out' });
    this.idle = scene.tweens.add({ targets: this.sprite, scaleY: 1.04, duration: 700, yoyo: true, repeat: -1, delay: 260 });
  }

  get stats() {
    return this.def.levels[this.level];
  }

  get nextLevel() {
    return this.def.levels[this.level + 1];
  }

  refreshStars() {
    this.stars.setText('★'.repeat(this.level + 1));
  }

  upgrade() {
    const next = this.nextLevel;
    if (!next) return;
    this.level++;
    this.spent += next.cost;
    this.refreshStars();
    this.aura.setFillStyle(this.def.color, 0.18 + this.level * 0.08);
    this.scene.tweens.add({ targets: this.aura, scaleX: 1.12, scaleY: 1.08, duration: 500, yoyo: true, repeat: -1 });
    this.scene.hitSpark(this.x, this.y - 14, this.def.color, 2);
  }

  update(dt) {
    this.cooldown -= dt;
    if (this.cooldown > 0) return;
    const target = this.scene.findTarget(this.x, this.y, this.stats.range);
    if (!target) return;
    this.sprite.setFlipX(target.x < this.x);
    this.cooldown = this.stats.cooldown;
    if (this.def.attack === 'punch') this.punch(target);
    else this.beam(target);
  }

  punch(target) {
    const dir = Math.sign(target.x - this.x) || 1;
    this.scene.tweens.add({ targets: this.sprite, x: this.x + dir * 8, duration: 60, yoyo: true });
    this.scene.hitSpark(target.x, target.y - 6, this.def.color);
    this.scene.damageNumber(target.x, target.y - 20, this.stats.damage);
    target.takeDamage(this.stats.damage);
  }

  beam(target) {
    const sx = this.x;
    const sy = this.y - 18;
    const angle = Math.atan2(target.y - sy, target.x - sx);
    const ex = sx + Math.cos(angle) * this.stats.range;
    const ey = sy + Math.sin(angle) * this.stats.range;
    this.scene.beamFx(sx, sy, ex, ey, this.def.color);
    // The beam pierces: every enemy close to the line gets hit
    for (const e of [...this.scene.enemies]) {
      if (e.alive && distToSegment(e.x, e.y, sx, sy, ex, ey) < 22) {
        this.scene.damageNumber(e.x, e.y - 20, this.stats.damage);
        e.takeDamage(this.stats.damage);
      }
    }
  }

  destroy() {
    this.scene.tweens.killTweensOf([this.sprite, this.aura]);
    this.sprite.destroy();
    this.aura.destroy();
    this.stars.destroy();
  }
}
