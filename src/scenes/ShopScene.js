import { GEAR, GEAR_SLOTS, RARITY, SPIN, gearText, gearBonus } from '../data/shop.js';
import { HEROES, newHeroSave, heroForm } from '../data/hero.js';
import { fighterPortrait, formLook, gearLook } from '../art/fighterArt.js';
import { drawMenuBackground, panel } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save, activeHero } from '../systems/Save.js';
import { Audio } from '../systems/Audio.js';
import { Ads, AD_REWARD, ADS_PER_DAY } from '../systems/Ads.js';
import { shopOpen, gearTier, tierNeed } from '../systems/Progress.js';
import { textStyle } from '../ui/theme.js';

export default class ShopScene extends Phaser.Scene {
  constructor() {
    super('Shop');
  }

  create(data = {}) {
    this.player = Save.current();
    if (!this.player) {
      this.scene.start('Login');
      return;
    }
    if (!shopOpen(this.player)) {
      this.scene.start('Hub');
      return;
    }
    drawMenuBackground(this);
    makeButton(this, 90, 40, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 40, 'Shop', textStyle(52, '#ffd93b')).setOrigin(0.5);
    this.add.image(1080, 40, 'coin');
    this.coinText = this.add.text(1100, 40, `${this.player.coins}`, textStyle(34, '#ffd93b')).setOrigin(0, 0.5);

    this.tab = data.tab ?? 'gear';
    this.tabs = [
      makeButton(this, 340, 112, 280, 54, 'Equipment', () => this.show('gear'), { fontSize: 28, color: 0x2a3350 }),
      makeButton(this, 640, 112, 280, 54, 'Lucky Spin', () => this.show('spin'), { fontSize: 28, color: 0x2a3350 }),
      makeButton(this, 940, 112, 280, 54, '🎬 Free coins', () => this.show('video'), { fontSize: 28, color: 0x2a3350 }),
    ];
    this.layer = this.add.container(0, 0);
    this.show(this.tab);
  }

  show(tab) {
    if (this.spinning) return;
    this.tab = tab;
    ['gear', 'spin', 'video'].forEach((t, i) => this.tabs[i].setAlpha(tab === t ? 1 : 0.6));
    this.shines?.forEach((t) => t.remove());
    this.shines = [];
    this.layer.removeAll(true);
    if (tab === 'gear') this.showGear();
    else if (tab === 'spin') this.showSpin();
    else this.showVideo();
  }

  refreshCoins() {
    this.player = Save.current();
    this.coinText.setText(`${this.player.coins}`);
  }

  // ---------- Equipment ----------

  // Equipment: the hero on the left wearing its gear, a tab for each gear slot,
  // and the 6 items of the chosen slot (Common up to Divine) in 2 rows. Pointing at a card tries it on.
  showGear() {
    const L = this.layer;
    const hero = activeHero(this.player);
    const worn = hero?.gear ?? {};
    this.slot ??= 'weapon';

    // The hero
    const def = hero ? HEROES[this.player.activeHero] : null;
    L.add(panel(this, 215, 425, 350, 490, def ? def.look.gi : 0x3a3f52));
    if (hero) {
      this.heroArt = null;
      this.dressHero(hero, def, worn);
      L.add(this.add.text(215, 412, def.name, textStyle(34)).setOrigin(0.5));
      L.add(this.add.text(215, 444, 'Gear can be worn by any hero', textStyle(16, '#9aa3c7')).setOrigin(0.5));
      const bonus = Object.fromEntries(Object.entries(gearBonus(worn)).filter(([, v]) => v));
      const text = Object.keys(bonus).length ? gearText({ stats: bonus }).split(', ').join('\n') : 'No gear yet';
      L.add(this.add.text(215, 472, 'Worn gear gives:', textStyle(19, '#ffd93b')).setOrigin(0.5, 0));
      L.add(this.add.text(215, 500, text, { ...textStyle(17, '#9bff7a'), align: 'center', lineSpacing: 2 }).setOrigin(0.5, 0));
    } else {
      L.add(this.add.text(215, 425, 'Win a hero in the\nLucky Spin to\nwear gear!', { ...textStyle(28), align: 'center' }).setOrigin(0.5));
    }

    // Slot tabs
    GEAR_SLOTS.forEach((slot, i) => {
      const x = 494 + i * 136;
      const on = slot.key === this.slot;
      const item = GEAR[worn[slot.key]];
      const tab = this.add.rectangle(x, 222, 128, 88, on ? 0x2a3350 : 0x161a28)
        .setStrokeStyle(3, on ? 0xffd93b : 0x3a4470).setInteractive({ useHandCursor: true });
      tab.on('pointerdown', () => {
        this.slot = slot.key;
        this.show('gear');
      });
      L.add(tab);
      L.add(this.gearIcon(0, 0, slot.key, item ? item.color : 0x5a6378).setPosition(x, 208).setScale(on ? 1.2 : 1));
      L.add(this.add.text(x, 250, slot.name, textStyle(18, on ? '#ffd93b' : '#9aa3c7')).setOrigin(0.5));
      if (item) L.add(this.add.circle(x + 50, 190, 6, 0x5be35b).setStrokeStyle(2, 0x10131c));
    });

    // The 6 items of this slot, weakest first
    Object.entries(GEAR).filter(([, g]) => g.slot === this.slot).sort((a, b) => a[1].tier - b[1].tier).forEach(([id, item], i) => {
      this.gearCard(id, item, 560 + (i % 3) * 275, 377 + Math.floor(i / 3) * 198, hero, def, worn);
    });
  }

  gearCard(id, item, x, y, hero, def, worn) {
    const L = this.layer;
    const rarity = RARITY[item.tier - 1];
    if (item.tier > gearTier(this.player)) {
      L.add(panel(this, x, y, 262, 190, 0x3a3f52));
      L.add(this.add.text(x, y - 62, rarity.name.toUpperCase(), textStyle(20, '#8a91ad')).setOrigin(0.5));
      L.add(this.add.text(x, y - 14, '🔒', { fontSize: '40px' }).setOrigin(0.5).setAlpha(0.8));
      L.add(this.add.text(x, y + 48, `Opens at ${tierNeed(item.tier)}`, textStyle(19, '#9aa3c7')).setOrigin(0.5));
      return;
    }
    const owned = this.player.items.includes(id);
    const wearing = worn[item.slot] === id;
    L.add(panel(this, x, y, 262, 190, wearing ? 0x5be35b : rarity.color));
    // The picture, in a ring of the tier's color (Legendary and better shine)
    const ix = x - 86;
    const iy = y - 28;
    if (item.tier >= 4) {
      const shine = this.add.image(ix, iy, 'glow').setTint(rarity.color).setBlendMode('ADD').setScale(1.05).setAlpha(0.55);
      this.shines.push(this.tweens.add({ targets: shine, alpha: 0.95, scale: 1.3, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' }));
      L.add(shine);
    }
    const ring = this.add.graphics();
    ring.fillStyle(0x10131c, 0.85).fillCircle(ix, iy, 34);
    ring.fillStyle(rarity.color, 0.22).fillCircle(ix, iy, 34);
    ring.lineStyle(3, rarity.color, 0.95).strokeCircle(ix, iy, 34);
    L.add(ring);
    L.add(this.gearIcon(0, 0, item.slot, item.color).setPosition(ix, iy).setScale(1.5));
    L.add(this.add.text(x - 42, y - 86, `${rarity.name.toUpperCase()}${'★'.repeat(Math.max(0, item.tier - 3))}`, textStyle(16, rarity.text)));
    const name = this.add.text(x - 42, y - 67, item.name, { ...textStyle(21), wordWrap: { width: 166 }, lineSpacing: -4 });
    L.add(name);
    L.add(this.add.text(x - 42, name.y + name.height, gearText(item).split(', ').join('\n'), { ...textStyle(15, '#9bff7a'), lineSpacing: -2 }));

    let label;
    let action;
    let color = 0x2f8a4a;
    if (wearing) {
      label = '✓ Wearing';
      color = 0x3a4470;
    } else if (owned && !hero) {
      label = 'Owned';
      color = 0x3a4470;
    } else if (owned) {
      label = 'Wear';
      action = () => this.wear(id);
    } else {
      label = `Buy  ${item.cost}`;
      color = 0xc99a00;
      action = () => this.buy(id);
    }
    const b = makeButton(this, x, y + 64, 236, 42, label, () => action?.(), { fontSize: 22, color });
    if (!action || (!owned && this.player.coins < item.cost)) b.setEnabled(false);
    L.add(b);

    // Point at the card to try the item on the hero
    if (hero) {
      const hit = this.add.rectangle(x, y - 26, 262, 134, 0xffffff, 0).setInteractive();
      hit.on('pointerover', () => this.dressHero(hero, def, { ...worn, [item.slot]: id }));
      hit.on('pointerout', () => this.dressHero(hero, def, worn));
      L.add(hit);
    }
  }

  // Draws the hero (in its form) wearing `gear`
  dressHero(hero, def, gear) {
    this.heroArt?.destroy();
    this.heroArt = fighterPortrait(this, 215, 290, { ...formLook(def.look, heroForm(hero)), ...gearLook(gear) }, 3);
    this.layer.add(this.heroArt);
  }

  // A small shaded picture of a gear piece
  gearIcon(x, y, slot, color) {
    const g = this.add.graphics();
    const dark = Phaser.Display.Color.ValueToColor(color).darken(30).color;
    const O = 0x0d0d12;
    g.lineStyle(2, O);
    if (slot === 'weapon') {
      // A fist glove with a cuff
      g.fillStyle(dark).fillRoundedRect(x - 9, y + 4, 18, 10, 3).strokeRoundedRect(x - 9, y + 4, 18, 10, 3);
      g.fillStyle(color).fillRoundedRect(x - 12, y - 13, 24, 19, 7).strokeRoundedRect(x - 12, y - 13, 24, 19, 7);
      g.lineStyle(1.5, O).lineBetween(x - 4, y - 13, x - 4, y - 5).lineBetween(x + 4, y - 13, x + 4, y - 5);
      g.fillStyle(0xffffff, 0.45).fillRoundedRect(x - 9, y - 11, 7, 4, 2);
    } else if (slot === 'armor') {
      // A chest plate with shoulder pads
      g.fillStyle(color).fillPoints([{ x: x - 14, y: y - 12 }, { x: x + 14, y: y - 12 }, { x: x + 11, y: y + 14 }, { x: x - 11, y: y + 14 }], true);
      g.strokePoints([{ x: x - 14, y: y - 12 }, { x: x + 14, y: y - 12 }, { x: x + 11, y: y + 14 }, { x: x - 11, y: y + 14 }], true);
      g.fillStyle(dark).fillCircle(x - 14, y - 11, 6).fillCircle(x + 14, y - 11, 6);
      g.lineStyle(2, O).strokeCircle(x - 14, y - 11, 6).strokeCircle(x + 14, y - 11, 6);
      g.lineStyle(2, dark).lineBetween(x, y - 10, x, y + 12);
      g.fillStyle(0xffffff, 0.35).fillRect(x - 9, y - 8, 6, 12);
    } else if (slot === 'pants') {
      // Two pant legs with a belt
      const leg = (lx) => [{ x: lx, y: y - 8 }, { x: lx + 11, y: y - 8 }, { x: lx + 10, y: y + 15 }, { x: lx + 1, y: y + 15 }];
      g.fillStyle(color).fillPoints(leg(x - 12), true).strokePoints(leg(x - 12), true);
      g.fillPoints(leg(x + 1), true).strokePoints(leg(x + 1), true);
      g.fillStyle(dark).fillRect(x - 13, y - 14, 26, 7).strokeRect(x - 13, y - 14, 26, 7);
      g.fillStyle(0xffffff, 0.4).fillRect(x - 9, y - 5, 3, 16);
    } else if (slot === 'boots') {
      g.fillStyle(color).fillRoundedRect(x - 9, y - 14, 11, 22, 3).strokeRoundedRect(x - 9, y - 14, 11, 22, 3);
      g.fillStyle(color).fillRoundedRect(x - 9, y + 3, 22, 10, 5).strokeRoundedRect(x - 9, y + 3, 22, 10, 5);
      g.fillStyle(dark).fillRect(x - 9, y + 10, 22, 3);
      g.fillStyle(0xffffff, 0.4).fillRect(x - 7, y - 12, 3, 14);
      g.fillStyle(0xffffff, 0.8).fillTriangle(x + 4, y - 10, x + 14, y - 6, x + 4, y - 3);
    } else if (slot === 'amulet') {
      g.lineStyle(2, 0xffd93b).beginPath().arc(x, y - 8, 11, Math.PI * 0.95, Math.PI * 0.05, false).strokePath();
      g.fillStyle(0xffd93b).fillCircle(x, y + 6, 11).lineStyle(2, O).strokeCircle(x, y + 6, 11);
      g.fillStyle(color).fillCircle(x, y + 6, 7);
      g.fillStyle(0xffffff, 0.7).fillCircle(x - 3, y + 3, 2.5);
    } else {
      // A glowing orb lens
      g.fillStyle(color, 0.3).fillCircle(x, y, 17);
      g.fillStyle(color).fillCircle(x, y, 12).lineStyle(2, O).strokeCircle(x, y, 12);
      g.fillStyle(dark).fillCircle(x + 3, y + 3, 6);
      g.fillStyle(0xffffff, 0.7).fillCircle(x - 4, y - 4, 4);
    }
    return g;
  }

  buy(id) {
    const item = GEAR[id];
    const ok = Save.update((p) => {
      if (p.coins < item.cost || p.items.includes(id)) return false;
      p.coins -= item.cost;
      p.items.push(id);
      const h = activeHero(p);
      if (h) h.gear[item.slot] = id;
      return true;
    });
    if (ok) {
      Audio.sfx('coin');
      this.refreshCoins();
      this.show('gear');
    }
  }

  wear(id) {
    Save.update((p) => {
      const h = activeHero(p);
      if (h) h.gear[GEAR[id].slot] = id;
    });
    this.refreshCoins();
    this.show('gear');
  }

  // ---------- Free coins (reward videos) ----------

  showVideo() {
    const L = this.layer;
    const left = Ads.left(this.player);
    L.add(panel(this, 640, 410, 620, 440, 0x5be35b));
    L.add(this.add.text(640, 255, '🎬', { fontSize: '84px' }).setOrigin(0.5));
    L.add(this.add.text(640, 340, 'Watch a video', textStyle(46, '#ffd93b')).setOrigin(0.5));
    L.add(this.add.image(585, 395, 'coin').setScale(1.5));
    L.add(this.add.text(612, 395, `+${AD_REWARD} coins`, textStyle(38, '#5be35b')).setOrigin(0, 0.5));
    L.add(this.add.text(640, 450, `Videos left today: ${left} / ${ADS_PER_DAY}`, textStyle(26, left ? '#c9d3ff' : '#ff8a8a')).setOrigin(0.5));
    const b = makeButton(this, 640, 530, 340, 80, left ? 'Watch' : 'Come back tomorrow', async () => {
      if (this.watching || Ads.left(Save.current()) <= 0) return;
      this.watching = true;
      const done = await Ads.show(this);
      this.watching = false;
      if (!this.scene.isActive() || !done || !Ads.reward()) return;
      Audio.sfx('coin');
      this.refreshCoins();
      this.show('video');
      const t = this.add.text(640, 600, `+${AD_REWARD} coins!`, textStyle(36, '#5be35b')).setOrigin(0.5);
      this.layer.add(t);
      this.tweens.add({ targets: t, y: 570, alpha: 0, delay: 900, duration: 700 });
    }, { color: 0x2f8a4a, fontSize: left ? 38 : 28 });
    b.setEnabled(left > 0);
    L.add(b);
  }

  // ---------- Lucky Spin ----------

  showSpin() {
    const L = this.layer;
    const cx = 430;
    const cy = 420;
    const r = 210;
    const total = SPIN.slices.reduce((a, s) => a + s.weight, 0);
    this.wheel = this.add.container(cx, cy);
    const g = this.add.graphics();
    // Every slice is drawn the same size, but chances follow `weight`
    const n = SPIN.slices.length;
    SPIN.slices.forEach((s, i) => {
      const a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
      const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
      g.fillStyle(s.color).slice(0, 0, r, a0, a1, false).fillPath();
      g.lineStyle(3, 0x10131c).slice(0, 0, r, a0, a1, false).strokePath();
      const am = (a0 + a1) / 2;
      const t = this.add.text(Math.cos(am) * r * 0.66, Math.sin(am) * r * 0.66, s.kind === 'coins' ? `${s.label}\ncoins` : s.label,
        { ...textStyle(s.kind === 'hero' ? 24 : 20, s.kind === 'hero' ? '#ffd93b' : '#ffffff'), align: 'center' }).setOrigin(0.5);
      t.setRotation(am + Math.PI / 2);
      this.wheel.add(t);
    });
    this.wheel.addAt(g, 0);
    this.wheel.add(this.add.circle(0, 0, 34, 0x10131c).setStrokeStyle(4, 0xffd93b));
    L.add(this.add.circle(cx, cy, r + 12, 0x10131c).setStrokeStyle(6, 0xffd93b));
    L.add(this.wheel);
    L.add(this.add.triangle(cx, cy - r - 22, -18, -16, 18, -16, 0, 18, 0xff3b3b).setStrokeStyle(3, 0x10131c));

    // Prize list and chances
    L.add(panel(this, 960, 300, 500, 260));
    L.add(this.add.text(960, 195, 'Win a new hero!', textStyle(32, '#ffd93b')).setOrigin(0.5));
    Object.entries(HEROES).forEach(([id, h], i) => {
      const x = 765 + i * 130;
      const owned = !!this.player.heroes[id];
      L.add(fighterPortrait(this, x, 285, h.look, 1.3, `hero_${id}_0`));
      L.add(this.add.text(x, 340, h.name, textStyle(22, owned ? '#5be35b' : '#ffffff')).setOrigin(0.5));
      L.add(this.add.text(x, 366, owned ? 'Owned' : h.title.split(' ').slice(-1)[0], textStyle(15, '#9aa3c7')).setOrigin(0.5));
    });
    const heroChance = SPIN.slices.filter((s) => s.kind === 'hero').reduce((a, s) => a + s.weight, 0) / total;
    L.add(this.add.text(960, 400, `Hero chance: ${Math.round(heroChance * 100)}%   -   Already have it? You get ${SPIN.dupeCoins} coins`,
      { ...textStyle(17, '#c9d3ff'), wordWrap: { width: 480 }, align: 'center' }).setOrigin(0.5));

    this.spinBtn = makeButton(this, 960, 500, 360, 90, `SPIN!  ${SPIN.cost}`, () => this.spin(), { color: 0xc99a00, fontSize: 40 });
    this.spinBtn.setEnabled(this.player.coins >= SPIN.cost);
    L.add(this.spinBtn);
    this.result = this.add.text(960, 600, '', { ...textStyle(30, '#5be35b'), align: 'center' }).setOrigin(0.5);
    L.add(this.result);
  }

  pickSlice() {
    const total = SPIN.slices.reduce((a, s) => a + s.weight, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < SPIN.slices.length; i++) {
      roll -= SPIN.slices[i].weight;
      if (roll < 0) return i;
    }
    return 0;
  }

  spin() {
    if (this.spinning || this.player.coins < SPIN.cost) return;
    const index = this.pickSlice();
    const slice = SPIN.slices[index];
    // Pay first, so leaving mid-spin can't give a free try
    Save.update((p) => { p.coins -= SPIN.cost; });
    this.refreshCoins();
    this.spinning = true;
    this.spinBtn.setEnabled(false);
    this.result.setText('');
    const n = SPIN.slices.length;
    // Land with the pointer (at the top) inside the chosen slice
    const sliceDeg = 360 / n;
    const target = 360 * 6 - (index * sliceDeg + sliceDeg / 2) + Phaser.Math.Between(-sliceDeg * 0.35, sliceDeg * 0.35);
    let last = 0;
    this.wheel.angle = 0;
    this.tweens.add({
      targets: this.wheel,
      angle: target,
      duration: 4200,
      ease: 'Cubic.Out',
      onUpdate: () => {
        const notch = Math.floor(this.wheel.angle / sliceDeg);
        if (notch !== last) {
          last = notch;
          Audio.sfx('spin', 0.03);
        }
      },
      onComplete: () => this.givePrize(slice),
    });
  }

  givePrize(slice) {
    let text = '';
    Save.update((p) => {
      if (slice.kind === 'coins') {
        p.coins += slice.amount;
        text = `You won ${slice.amount} coins!`;
      } else if (slice.kind === 'gear') {
        const tier = gearTier(p);
        const free = Object.keys(GEAR).filter((id) => !p.items.includes(id) && GEAR[id].tier <= tier).sort((a, b) => GEAR[a].cost - GEAR[b].cost);
        if (free.length) {
          const id = free[Math.floor(Math.random() * Math.min(4, free.length))];
          p.items.push(id);
          text = `You won ${GEAR[id].name}!\nWear it from the Equipment tab.`;
        } else {
          p.coins += 500;
          text = 'You own all the gear sold so far:\n+500 coins!';
        }
      } else if (p.heroes[slice.hero]) {
        p.coins += SPIN.dupeCoins;
        text = `${HEROES[slice.hero].name} again!\nTurned into ${SPIN.dupeCoins} coins.`;
      } else {
        p.heroes[slice.hero] = newHeroSave();
        // The first hero is put to work right away
        const first = !p.activeHero;
        if (first) p.activeHero = slice.hero;
        text = first ? `YOUR FIRST HERO: ${HEROES[slice.hero].name}!\nThey join your next battle.`
          : `NEW HERO: ${HEROES[slice.hero].name}!\nChoose them on the Heroes screen.`;
      }
    });
    Audio.sfx(slice.kind === 'hero' ? 'win' : 'coin');
    if (slice.kind === 'hero') this.cameras.main.flash(300, 255, 230, 120);
    this.spinning = false;
    this.refreshCoins();
    this.show('spin');
    this.result.setText(text);
    this.result.setScale(0.5);
    this.tweens.add({ targets: this.result, scale: 1, duration: 300, ease: 'Back.Out' });
  }
}
