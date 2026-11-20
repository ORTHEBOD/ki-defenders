import { PETS } from '../data/pets.js';

// The player's pet in battle: floats next to the hero (or the base) flapping between its 2 pictures,
// and helps: the dragon shoots fireballs, the kitten heals the hero. The turtle's guard and the fox's
// coins and Ki are counted by GameScene (see `guard` and `def.coins`).
export default class Pet {
  constructor(scene, id, home) {
    this.scene = scene;
    this.id = id;
    this.def = PETS[id];
    this.home = home;
    this.x = home.x;
    this.y = home.y;
    this.timer = 1;
    this.flap = 0;
    this.t = Math.random() * 10;
    this.guard = this.def.guard ?? 0;
    this.key = `pet_${id}`;
    const pic = scene.textures.exists(this.key);
    this.sprite = scene.add.image(this.x, this.y, pic ? this.key : 'glow').setDepth(27);
    this.sprite.setScale(pic ? 46 / Math.max(this.sprite.width, this.sprite.height) : 0.6);
    this.shadow = scene.add.ellipse(this.x, this.y + 30, 28, 8, 0x000000, 0.22).setDepth(9);
  }

  // Where the pet wants to be: just behind the hero's shoulder, or above the base
  get spot() {
    const h = this.scene.hero;
    if (h?.alive) return { x: h.x - 34, y: h.y - 52 };
    return this.home;
  }

  update(dt) {
    this.t += dt;
    const s = this.spot;
    const k = Math.min(1, dt * 4);
    const dx = (s.x - this.x) * k;
    this.x += dx;
    this.y += (s.y - this.y) * k;
    if (Math.abs(dx) > 0.3) this.sprite.setFlipX(dx < 0);
    this.flap -= dt;
    if (this.flap <= 0 && this.scene.textures.exists(`${this.key}_1`)) {
      this.flap = 0.35;
      this.sprite.setTexture(this.sprite.texture.key === this.key ? `${this.key}_1` : this.key);
    }
    const bob = Math.sin(this.t * 3) * 4;
    this.sprite.setPosition(this.x, this.y + bob);
    this.shadow.setPosition(this.x, this.y + 34);

    this.timer -= dt;
    if (this.timer > 0) return;
    if (this.def.fire) this.shoot();
    else if (this.def.heal) this.heal();
  }

  // Grows with the level number (or the Endless wave), so the pet keeps up with the monsters
  get power() {
    const sc = this.scene;
    return sc.endless ? 1.1 ** sc.waveIndex : 1 + 0.07 * (sc.level.id - 1);
  }

  shoot() {
    const f = this.def.fire;
    const e = this.scene.findNearest(this.x, this.y, f.range);
    if (!e) {
      this.timer = 0.3;
      return;
    }
    this.timer = f.every;
    this.sprite.setFlipX(e.x < this.x);
    this.scene.fireBlast(this.x + (e.x < this.x ? -16 : 16), this.y - 4, e, {
      damage: Math.round(f.damage * this.power), splash: f.splash, color: this.def.color, size: 8,
    });
  }

  heal() {
    const h = this.scene.hero;
    this.timer = this.def.heal.every;
    if (!h?.alive || h.hp >= h.maxHp) return;
    h.hp = Math.min(h.maxHp, h.hp + h.maxHp * this.def.heal.amount);
    h.draw();
    this.scene.glowFx(h.x, h.y - 14, 0x7fffa0, 0.4, 1, 400);
    this.scene.floatText(h.x, h.y - 70, '+', '#5be35b', 22);
  }

  // The turtle stops a monster at the base. Returns true if it did.
  block(e) {
    if (this.guard <= 0) return false;
    this.guard--;
    this.scene.flashFx(e.x, e.y - 10, 50, this.def.color);
    this.scene.floatText(e.x, e.y - 50, `Shell block! (${this.guard} left)`, '#7fe37f', 22);
    return true;
  }
}
