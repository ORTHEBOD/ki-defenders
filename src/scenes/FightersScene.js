import { FIGHTERS, FORMS, FORM_LEVELS, START_UPS } from '../data/fighters.js';
import { fighterPortrait, formLook } from '../art/fighterArt.js';
import { drawMenuBackground, panel } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save } from '../systems/Save.js';
import { maxForm } from '../systems/Progress.js';
import { Audio } from '../systems/Audio.js';
import { textStyle } from '../ui/theme.js';
import { SKINS, FIGHTER_SKINS } from '../data/skins.js';
import { skinTexture } from '../art/skins.js';

const hex = (c) => `#${c.toString(16).padStart(6, '0')}`;

// The fighters (towers): who has joined the team, and how far they can power up.
// New fighters can be tried on the level they join at; after beating it they are bought here with coins.
// The story opens higher forms (see FORM_LEVELS).
export default class FightersScene extends Phaser.Scene {
  constructor() {
    super('Fighters');
  }

  create(data) {
    const player = Save.current();
    if (!player) {
      this.scene.start('Login');
      return;
    }
    drawMenuBackground(this);
    makeButton(this, 90, 40, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 40, 'Fighters', textStyle(44, '#ffd93b')).setOrigin(0.5);
    this.add.text(905, 40, '💎', { fontSize: '26px' }).setOrigin(0.5);
    this.add.text(925, 40, `${player.diamonds}`, textStyle(30, '#7fe3ff')).setOrigin(0, 0.5);
    this.add.image(1110, 40, 'coin');
    this.add.text(1130, 40, `${player.coins}`, textStyle(30, '#ffd93b')).setOrigin(0, 0.5);
    this.add.text(640, 84, 'In battle, fighters share the EXP of each enemy by the damage they did. Spend Ki to upgrade them.',
      textStyle(20, '#c9d3ff')).setOrigin(0.5);

    const top = maxForm(player);
    const form = FORMS[top];

    // One card per fighter, shown in the highest form the story has opened
    Object.entries(FIGHTERS).forEach(([type, def], i) => {
      const x = 160 + i * 240;
      const joined = player.super || player.fighters.includes(type);
      // Its level is beaten, so it can be bought
      const forSale = !joined && (player.stars[def.unlock] ?? 0) > 0;
      panel(this, x, 270, 220, 300, joined ? def.color : 0x3a3f52);
      // The top upgrade of that form: headband and cape
      const look = { ...formLook(def.look, top), rank: 3, trim: top > 0 ? form.aura : def.color };
      const lit = joined || forSale;
      const art = fighterPortrait(this, x, 220, lit ? look : { ...def.look, gi: 0x202430, skin: 0x202430, hair: 0x202430, belt: 0x202430, boots: 0x202430 }, 2.6,
        lit ? `${def.texture}_${top}` : null);
      const worn = player.skins[type]?.worn;
      if (lit && worn && art.setTexture) art.setTexture(skinTexture(this, art.texture.key, worn));
      if (!lit) this.add.text(x, 220, '🔒', { fontSize: '44px' }).setOrigin(0.5);
      else this.tweens.add({ targets: art, y: art.y - 6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut', delay: i * 150 });
      this.add.text(x, 330, def.name, textStyle(30, lit ? '#ffffff' : '#8a91ad')).setOrigin(0.5);
      this.add.text(x, 362, def.role, textStyle(20, '#c9d3ff')).setOrigin(0.5);
      if (forSale) {
        makeButton(this, x, 396, 190, 40, `Buy  ${def.price} coins`, () => this.buy(type, def, x),
          { fontSize: 20, color: player.coins >= def.price ? 0x2f8a4a : 0x5a5f72 });
        makeButton(this, x, 442, 190, 34, `or  ${def.diamonds} 💎`, () => this.buy(type, def, x, 'diamonds'),
          { fontSize: 18, color: player.diamonds >= def.diamonds ? 0x2a7fa8 : 0x5a5f72 });
      } else {
        this.add.text(x, 398, joined ? `Up to ${form.name}` : `Joins at level ${def.unlock}`,
          textStyle(19, joined ? form.color : '#ffd93b')).setOrigin(0.5);
      }
      if (joined) this.startUp(player, type, x);
      if (joined && FIGHTER_SKINS[type]) {
        makeButton(this, x + 76, 146, 52, 40, '🎨', () => this.skinsPopup(player, type, def, top), { fontSize: 22, color: 0x6a3ab8 });
        // Back from buying or wearing a skin: the skins stay open
        if (data?.skins === type) this.skinsPopup(player, type, def, top);
      }
    });

    // The forms, and the story level that opens each one
    panel(this, 640, 560, 1200, 190);
    this.add.text(640, 488, 'Forms open as you beat the story', textStyle(26, '#ffd93b')).setOrigin(0.5);
    FORMS.forEach((f, i) => {
      const x = 140 + i * 200;
      const open = i <= top;
      const color = i === 0 ? 0xffffff : f.aura;
      this.add.circle(x, 560, 30, open ? color : 0x10131c, open ? 0.9 : 1).setStrokeStyle(4, color, open ? 1 : 0.4);
      this.add.text(x, 560, open ? '✓' : '🔒', { ...textStyle(26, '#10131c'), fontSize: open ? '30px' : '24px' }).setOrigin(0.5);
      this.add.text(x, 610, f.name, textStyle(20, open ? hex(color) : '#8a91ad')).setOrigin(0.5);
      this.add.text(x, 636, i === 0 ? 'From the start' : `Beat level ${FORM_LEVELS[i]}`, textStyle(17, '#9aa3c7')).setOrigin(0.5);
      if (i < FORMS.length - 1) this.add.text(x + 100, 560, '›', textStyle(34, '#5a6378')).setOrigin(0.5);
    });
  }

  // Start upgrade: the fighter is built one step higher. The next one opens 8 levels after its form.
  startUp(player, type, x) {
    const have = player.startTier[type] ?? 0;
    const up = START_UPS[have];
    if (!up) {
      this.add.text(x, 442, `Starts at level ${have + 1} (max)`, textStyle(17, '#5be35b')).setOrigin(0.5);
      return;
    }
    if (!player.super && !(player.stars[up.level] > 0)) {
      this.add.text(x, 442, `Start Lv ${have + 2}: beat level ${up.level}`, textStyle(17, '#9aa3c7')).setOrigin(0.5);
      return;
    }
    const b = makeButton(this, x, 442, 214, 36, `Start Lv ${have + 2}:  ${up.cost} coins`, () => {
      const done = Save.update((p) => {
        if ((p.startTier[type] ?? 0) !== have || p.coins < up.cost) return false;
        p.coins -= up.cost;
        p.startTier[type] = have + 1;
        return true;
      });
      if (done) {
        Audio.sfx('coin');
        this.scene.restart();
      }
    }, { fontSize: 16, color: 0xc99a00 });
    b.setEnabled(player.coins >= up.cost);
  }

  // A fighter's skins: wear one you own, or buy one with diamonds (it is worn right away)
  skinsPopup(player, type, def, top) {
    const pop = this.add.container(0, 0).setDepth(200);
    pop.add(this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.65).setOrigin(0).setInteractive());
    pop.add(panel(this, 640, 370, 960, 470, def.color));
    pop.add(this.add.text(640, 170, `${def.name} skins`, textStyle(42, '#ffd93b')).setOrigin(0.5));
    const mine = player.skins[type] ?? { owned: [], worn: null };
    [null, ...FIGHTER_SKINS[type]].forEach((id, i) => {
      const x = 640 + (i - 1.5) * 220;
      const skin = SKINS[id];
      const look = { ...formLook(def.look, top), rank: 3 };
      const art = fighterPortrait(this, x, 300, look, 2.2, `${def.texture}_${top}`);
      if (id && art.setTexture) art.setTexture(skinTexture(this, art.texture.key, id));
      pop.add(art);
      pop.add(this.add.text(x, 410, skin ? skin.name : 'Normal', textStyle(28)).setOrigin(0.5));
      const wearing = mine.worn === id;
      const owned = !id || mine.owned.includes(id);
      let label = 'Wear';
      if (wearing) label = '✓ Wearing';
      else if (!owned) label = `${skin.price} 💎`;
      const b = makeButton(this, x, 462, 180, 48, label, () => this.wearSkin(type, id), {
        fontSize: 22, color: wearing ? 0x2f8a4a : owned ? 0x3a4470 : player.diamonds >= skin.price ? 0x2a7fa8 : 0x5a5f72,
      });
      if (wearing) b.setEnabled(false);
      pop.add(b);
    });
    pop.add(makeButton(this, 640, 560, 200, 50, 'Close', () => {
      pop.setVisible(false);
      this.time.delayedCall(1, () => pop.destroy());
    }, { fontSize: 24, color: 0x3a4470 }));
  }

  wearSkin(type, id) {
    const done = Save.update((p) => {
      const s = (p.skins[type] ??= { owned: [], worn: null });
      if (id && !s.owned.includes(id)) {
        const price = SKINS[id].price;
        if (p.diamonds < price) return false;
        p.diamonds -= price;
        s.owned.push(id);
      }
      s.worn = id;
      return true;
    });
    if (!done) {
      const msg = this.add.text(640, 520, 'Not enough 💎', textStyle(26, '#ff6b6b')).setOrigin(0.5).setDepth(210);
      this.tweens.add({ targets: msg, y: 500, alpha: 0, delay: 700, duration: 600, onComplete: () => msg.destroy() });
      return;
    }
    Audio.sfx('coin');
    this.scene.restart({ skins: type });
  }

  buy(type, def, x, currency = 'coins') {
    const price = currency === 'diamonds' ? def.diamonds : def.price;
    const done = Save.update((p) => {
      if (p.fighters.includes(type) || p[currency] < price) return false;
      p[currency] -= price;
      p.fighters.push(type);
      return true;
    });
    if (!done) {
      const msg = this.add.text(x, 440, currency === 'diamonds' ? 'Not enough 💎' : 'Not enough coins', textStyle(22, '#ff6b6b')).setOrigin(0.5);
      this.tweens.add({ targets: msg, y: 420, alpha: 0, delay: 700, duration: 600, onComplete: () => msg.destroy() });
      return;
    }
    Audio.sfx('coin');
    this.scene.restart();
  }
}
