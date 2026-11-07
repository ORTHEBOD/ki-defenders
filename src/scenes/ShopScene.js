import { GEAR, GEAR_SLOTS, SPIN, gearText } from '../data/shop.js';
import { HEROES, newHeroSave } from '../data/hero.js';
import { fighterPortrait } from '../art/fighterArt.js';
import { drawMenuBackground, panel } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save, activeHero } from '../systems/Save.js';
import { Audio } from '../systems/Audio.js';
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
    drawMenuBackground(this);
    makeButton(this, 90, 40, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 40, 'Shop', textStyle(52, '#ffd93b')).setOrigin(0.5);
    this.add.image(1080, 40, 'coin');
    this.coinText = this.add.text(1100, 40, `${this.player.coins}`, textStyle(34, '#ffd93b')).setOrigin(0, 0.5);

    this.tab = data.tab ?? 'gear';
    this.tabs = [
      makeButton(this, 480, 112, 300, 54, 'Equipment', () => this.show('gear'), { fontSize: 28, color: 0x2a3350 }),
      makeButton(this, 800, 112, 300, 54, 'Lucky Spin', () => this.show('spin'), { fontSize: 28, color: 0x2a3350 }),
    ];
    this.layer = this.add.container(0, 0);
    this.show(this.tab);
  }

  show(tab) {
    if (this.spinning) return;
    this.tab = tab;
    this.tabs[0].setAlpha(tab === 'gear' ? 1 : 0.6);
    this.tabs[1].setAlpha(tab === 'spin' ? 1 : 0.6);
    this.layer.removeAll(true);
    if (tab === 'gear') this.showGear();
    else this.showSpin();
  }

  refreshCoins() {
    this.player = Save.current();
    this.coinText.setText(`${this.player.coins}`);
  }

  // ---------- Equipment ----------

  showGear() {
    const L = this.layer;
    const hero = activeHero(this.player);
    const worn = hero?.gear ?? {};
    const note = hero
      ? `Bought gear can be worn by any hero. Buying puts it on ${HEROES[this.player.activeHero].name}.`
      : 'Bought gear can be worn by any hero - win your first hero in the Lucky Spin!';
    L.add(this.add.text(640, 160, note, textStyle(20, '#c9d3ff')).setOrigin(0.5));
    GEAR_SLOTS.forEach((slot, col) => {
      const x = 134 + col * 253;
      L.add(this.add.text(x, 200, slot.name, textStyle(26, '#ffd93b')).setOrigin(0.5));
      Object.entries(GEAR).filter(([, g]) => g.slot === slot.key).forEach(([id, item], row) => {
        const y = 300 + row * 140;
        const owned = this.player.items.includes(id);
        const wearing = worn[slot.key] === id;
        L.add(panel(this, x, y, 240, 124, item.color));
        L.add(this.gearIcon(x - 92, y - 10, slot.key, item.color));
        L.add(this.add.text(x - 64, y - 38, item.name, textStyle(19)).setOrigin(0, 0.5));
        L.add(this.add.text(x - 64, y - 4, gearText(item), { ...textStyle(14, '#9bff7a'), wordWrap: { width: 170 } }).setOrigin(0, 0.5));
        let label;
        let action;
        let color = 0x2f8a4a;
        if (wearing) {
          label = 'Wearing';
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
        const b = makeButton(this, x + 22, y + 36, 180, 40, label, () => action?.(), { fontSize: 19, color });
        if (!action || (!owned && this.player.coins < item.cost)) b.setEnabled(false);
        L.add(b);
      });
    });
  }

  gearIcon(x, y, slot, color) {
    const g = this.add.graphics();
    g.lineStyle(2, 0x0d0d12).fillStyle(color);
    if (slot === 'weapon') {
      g.fillRoundedRect(x - 12, y - 10, 24, 22, 6).strokeRoundedRect(x - 12, y - 10, 24, 22, 6);
      g.fillStyle(0xffffff, 0.5).fillRect(x - 8, y - 6, 16, 4);
    } else if (slot === 'armor') {
      g.fillRoundedRect(x - 14, y - 14, 28, 28, 6).strokeRoundedRect(x - 14, y - 14, 28, 28, 6);
      g.lineStyle(2, 0x0d0d12).lineBetween(x, y - 14, x, y + 14);
    } else if (slot === 'accessory') {
      g.fillCircle(x, y, 13).strokeCircle(x, y, 13);
      g.fillStyle(0xffffff, 0.6).fillCircle(x - 4, y - 4, 4);
    } else if (slot === 'boots') {
      g.fillRect(x - 10, y - 14, 10, 22).strokeRect(x - 10, y - 14, 10, 22);
      g.fillRoundedRect(x - 10, y + 4, 22, 10, 4).strokeRoundedRect(x - 10, y + 4, 22, 10, 4);
    } else {
      g.lineStyle(2, 0xffd93b).strokeCircle(x, y - 6, 12);
      g.fillCircle(x, y + 8, 9).lineStyle(2, 0x0d0d12).strokeCircle(x, y + 8, 9);
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
        const free = Object.keys(GEAR).filter((id) => !p.items.includes(id)).sort((a, b) => GEAR[a].cost - GEAR[b].cost);
        if (free.length) {
          const id = free[Math.floor(Math.random() * Math.min(4, free.length))];
          p.items.push(id);
          text = `You won ${GEAR[id].name}!\nWear it from the Equipment tab.`;
        } else {
          p.coins += 500;
          text = 'You own all gear: +500 coins!';
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
