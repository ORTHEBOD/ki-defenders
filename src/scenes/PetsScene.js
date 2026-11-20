import { PETS } from '../data/pets.js';
import { drawMenuBackground, panel } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save } from '../systems/Save.js';
import { Audio } from '../systems/Audio.js';
import { textStyle } from '../ui/theme.js';

// The pets: buy them with diamonds, and pick the one that comes along to battles
export default class PetsScene extends Phaser.Scene {
  constructor() {
    super('Pets');
  }

  create() {
    const player = Save.current();
    if (!player) {
      this.scene.start('Login');
      return;
    }
    drawMenuBackground(this);
    makeButton(this, 90, 40, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 40, '🐾 Pets', textStyle(48, '#ffd93b')).setOrigin(0.5);
    this.add.text(1110, 40, '💎', { fontSize: '26px' }).setOrigin(0.5);
    this.add.text(1130, 40, `${player.diamonds}`, textStyle(30, '#7fe3ff')).setOrigin(0, 0.5);
    this.add.text(640, 92, 'A pet comes along to every battle and helps. Pick one to take with you!', textStyle(22, '#c9d3ff')).setOrigin(0.5);

    Object.entries(PETS).forEach(([id, def], i) => {
      const x = 205 + i * 290;
      const owned = player.pets.owned.includes(id);
      const active = player.pets.active === id;
      panel(this, x, 380, 260, 470, active ? 0xffd93b : def.color);
      // The full-size pictures (the battle ones are shrunk)
      const key = `art_pet_${id}`;
      if (this.textures.exists(key)) {
        const pic = this.add.image(x, 270, key);
        pic.setScale(170 / Math.max(pic.width, pic.height));
        // Flaps between its 2 pictures, and floats up and down
        this.time.addEvent({ delay: 380, loop: true, callback: () => pic.setTexture(pic.texture.key === key ? `${key}_1` : key) });
        this.tweens.add({ targets: pic, y: 258, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut', delay: i * 200 });
      }
      this.add.text(x, 390, def.name, textStyle(30)).setOrigin(0.5);
      this.add.text(x, 452, def.text, { ...textStyle(20, '#c9d3ff'), align: 'center', wordWrap: { width: 230 } }).setOrigin(0.5);
      let label = `Buy  ${def.price} 💎`;
      let color = player.diamonds >= def.price ? 0x2a7fa8 : 0x5a5f72;
      if (active) {
        label = '✓ With you';
        color = 0x2f8a4a;
      } else if (owned) {
        label = 'Take along';
        color = 0xe0661a;
      }
      makeButton(this, x, 560, 220, 56, label, () => this.pick(id), { fontSize: 24, color });
      if (active) {
        makeButton(this, x, 616, 180, 34, 'Leave at home', () => this.leave(), { fontSize: 16, color: 0x3a4470 });
      }
    });
  }

  // Buys the pet if needed, and takes it along
  pick(id) {
    const done = Save.update((p) => {
      if (!p.pets.owned.includes(id)) {
        if (p.diamonds < PETS[id].price) return false;
        p.diamonds -= PETS[id].price;
        p.pets.owned.push(id);
      }
      p.pets.active = id;
      return true;
    });
    if (!done) {
      const msg = this.add.text(640, 680, 'Not enough 💎 - win them on the leaderboard, badges and the 4th stars!', textStyle(24, '#ff6b6b')).setOrigin(0.5);
      this.tweens.add({ targets: msg, alpha: 0, delay: 1600, duration: 600, onComplete: () => msg.destroy() });
      return;
    }
    Audio.sfx('coin');
    this.scene.restart();
  }

  leave() {
    Save.update((p) => {
      p.pets.active = null;
    });
    this.scene.restart();
  }
}
