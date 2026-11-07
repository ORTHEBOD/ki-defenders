import { HEROES, SKILL_TREE, xpToNext, skillPoints, learnedSkills, heroPower, heroMaxHp } from '../data/hero.js';
import { GEAR, GEAR_SLOTS, gearBonus } from '../data/shop.js';
import { fighterPortrait } from '../art/fighterArt.js';
import { drawMenuBackground, panel, xpBar } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save, activeHero } from '../systems/Save.js';
import { textStyle } from '../ui/theme.js';

const hex = (c) => `#${c.toString(16).padStart(6, '0')}`;

export default class HeroScene extends Phaser.Scene {
  constructor() {
    super('Hero');
  }

  create(data = {}) {
    const player = Save.current();
    if (!player) {
      this.scene.start('Login');
      return;
    }
    const heroId = player.activeHero;
    const def = HEROES[heroId];
    const hero = activeHero(player);
    drawMenuBackground(this);
    makeButton(this, 90, 40, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.drawPicker(player, heroId);
    if (!hero) {
      // No hero yet: they come from the Lucky Spin
      panel(this, 640, 400, 760, 360);
      this.add.text(640, 320, 'No hero yet!', textStyle(56, '#ffd93b')).setOrigin(0.5);
      this.add.text(640, 390, 'Win your first hero in the Lucky Spin.\nPlay levels to earn coins for spins.',
        { ...textStyle(26), align: 'center' }).setOrigin(0.5);
      makeButton(this, 640, 490, 320, 70, 'Go to the Shop', () => this.scene.start('Shop', { tab: 'spin' }),
        { color: 0x2f8a4a, fontSize: 32 });
      return;
    }
    this.learned = new Set(learnedSkills(hero));
    this.points = skillPoints(hero);
    if (this.learned.size > 0) {
      makeButton(this, 1170, 40, 180, 50, 'Reset skills', () => {
        Save.update((p) => { activeHero(p).skills = []; });
        this.scene.restart();
      }, { fontSize: 22, color: 0x8a2f3a });
    }

    // Hero info and gear
    this.drawInfo(player, hero, def);
    this.drawTree(data);
  }

  // Hero picker: tap an owned hero to use them
  drawPicker(player, heroId) {
    Object.entries(HEROES).forEach(([id, h], i) => {
      const x = 400 + i * 160;
      const owned = !!player.heroes[id];
      const chosen = id === heroId;
      const box = this.add.rectangle(x, 44, 150, 72, chosen ? 0x3a2a10 : 0x10131c, 0.9)
        .setStrokeStyle(3, chosen ? 0xffd93b : owned ? h.look.gi : 0x3a3f52);
      const face = fighterPortrait(this, x - 46, 50, h.look, 0.8, `hero_${id}_0`);
      face.setAlpha(owned ? 1 : 0.35);
      this.add.text(x - 14, 34, h.name, textStyle(22, owned ? '#ffffff' : '#8a91ad')).setOrigin(0, 0.5);
      this.add.text(x - 14, 60, owned ? (chosen ? 'In use' : `Lv ${player.heroes[id].level}`) : 'Lucky Spin', textStyle(15, chosen ? '#ffd93b' : '#9aa3c7'))
        .setOrigin(0, 0.5);
      if (owned && !chosen) {
        box.setInteractive({ useHandCursor: true });
        box.on('pointerdown', () => {
          Save.update((p) => { p.activeHero = id; });
          this.scene.restart();
        });
      }
    });
  }

  drawInfo(player, hero, def) {
    const bonus = gearBonus(hero.gear);
    panel(this, 230, 405, 400, 560, def.look.gi);
    fighterPortrait(this, 230, 210, def.look, 2.4, `hero_${player.activeHero}_0`);
    this.add.text(230, 300, `${def.name}  Lv ${hero.level}`, textStyle(36)).setOrigin(0.5);
    this.add.text(230, 334, def.title, textStyle(19, '#c9d3ff')).setOrigin(0.5);
    const need = xpToNext(hero.level);
    xpBar(this, 70, 352, 320, 16, hero.xp / need);
    this.add.text(230, 382, `XP ${hero.xp} / ${need}`, textStyle(17, '#c9d3ff')).setOrigin(0.5);
    const hp = Math.round(heroMaxHp(hero.level, def.base.hp) * (1 + bonus.hp));
    const dmg = Math.round(def.base.damage * heroPower(hero.level) * (1 + bonus.damage));
    this.add.text(230, 410, `HP ${hp}   Damage ${dmg}   Range ${def.base.range}`, textStyle(19)).setOrigin(0.5);
    this.add.text(230, 438, `Skill points: ${this.points}`, textStyle(22, this.points > 0 ? '#5be35b' : '#c9d3ff')).setOrigin(0.5);
    if (def.perk) {
      this.add.text(230, 468, def.perk, { ...textStyle(15, '#ffe9c4'), wordWrap: { width: 360 }, align: 'center' }).setOrigin(0.5);
    }

    // Gear: tap a slot to switch between the items you own for it
    this.add.text(230, 496, 'Gear (tap to change)', textStyle(18, '#9aa3c7')).setOrigin(0.5);
    GEAR_SLOTS.forEach((slot, i) => {
      const y = 526 + i * 32;
      const id = hero.gear[slot.key];
      const item = GEAR[id];
      const row = this.add.rectangle(230, y, 360, 28, 0x1c2133).setStrokeStyle(2, item ? item.color : 0x3a3f52)
        .setInteractive({ useHandCursor: true });
      this.add.text(60, y, slot.name, textStyle(16, '#9aa3c7')).setOrigin(0, 0.5);
      this.add.text(140, y, item ? item.name : '- empty -', textStyle(17, item ? '#ffffff' : '#6a7090')).setOrigin(0, 0.5);
      row.on('pointerdown', () => {
        const owned = player.items.filter((g) => GEAR[g].slot === slot.key);
        if (!owned.length) {
          this.flash('Buy gear in the Shop!');
          return;
        }
        const choices = [undefined, ...owned];
        const next = choices[(choices.indexOf(id) + 1) % choices.length];
        Save.update((p) => {
          if (next) activeHero(p).gear[slot.key] = next;
          else delete activeHero(p).gear[slot.key];
        });
        this.scene.restart();
      });
    });

  }

  // Skill tree: 4 branches, learned top to bottom
  drawTree(data) {
    panel(this, 845, 405, 790, 560);
    SKILL_TREE.forEach((branch, b) => {
      const x = 545 + b * 200;
      this.add.text(x, 152, branch.branch, textStyle(24, hex(branch.color))).setOrigin(0.5);
      this.add.graphics().lineStyle(4, branch.color, 0.35).lineBetween(x, 190, x, 192 + (branch.skills.length - 1) * 66);
      branch.skills.forEach((skill, i) => {
        const y = 192 + i * 66;
        const state = this.skillState(branch, i);
        const fill = state === 'learned' ? branch.color : 0x10131c;
        const node = this.add.circle(x, y, 21, fill).setStrokeStyle(4, branch.color, state === 'locked' ? 0.35 : 1);
        const icon = state === 'learned' ? '✔' : state === 'ready' ? '+' : '🔒';
        this.add.text(x, y, icon, state === 'locked' ? { fontSize: '16px' } : textStyle(22, state === 'learned' ? '#10131c' : '#5be35b'))
          .setOrigin(0.5).setAlpha(state === 'locked' ? 0.6 : 1);
        this.add.text(x, y + 31, skill.name, textStyle(15, state === 'locked' ? '#8a91ad' : '#ffffff')).setOrigin(0.5);
        if (state === 'ready') this.tweens.add({ targets: node, scale: 1.12, duration: 600, yoyo: true, repeat: -1 });
        node.setInteractive({ useHandCursor: true });
        node.on('pointerdown', () => this.showSkill(branch, i));
      });
    });

    this.info = this.add.container(0, 0);
    const sel = data.selected;
    if (sel) this.showSkill(SKILL_TREE[sel.b], sel.i);
    else this.info.add(this.add.text(845, 638, 'Tap a skill to see what it does', textStyle(22, '#ffe9c4')).setOrigin(0.5));
  }

  flash(text) {
    const t = this.add.text(230, 470, text, textStyle(24, '#ffd93b')).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: t, y: 440, alpha: 0, duration: 1200, onComplete: () => t.destroy() });
  }

  // learned / ready (can learn now) / next (needs a point) / locked (learn the one above first)
  skillState(branch, i) {
    const skill = branch.skills[i];
    if (this.learned.has(skill.id)) return 'learned';
    const prevDone = i === 0 || this.learned.has(branch.skills[i - 1].id);
    if (!prevDone || (skill.needs && !this.learned.has(skill.needs))) return 'locked';
    return this.points > 0 ? 'ready' : 'next';
  }

  lockReason(branch, i) {
    if (i > 0 && !this.learned.has(branch.skills[i - 1].id)) return branch.skills[i - 1].name;
    const need = branch.skills[i].needs;
    return SKILL_TREE.flatMap((b) => b.skills).find((s) => s.id === need)?.name ?? need;
  }

  showSkill(branch, i) {
    this.info.removeAll(true);
    const skill = branch.skills[i];
    const state = this.skillState(branch, i);
    this.info.add(this.add.rectangle(845, 642, 770, 70, 0x10131c, 1));
    this.info.add(this.add.text(475, 626, skill.name, textStyle(24, hex(branch.color))).setOrigin(0, 0.5));
    this.info.add(this.add.text(475, 656, skill.desc, textStyle(19, '#ffffff')).setOrigin(0, 0.5));

    let status = '';
    if (state === 'learned') status = 'Learned';
    else if (state === 'locked') status = `Learn ${this.lockReason(branch, i)} first`;
    else if (state === 'next') status = 'Needs 1 skill point';
    if (status) {
      this.info.add(this.add.text(1215, 642, status, textStyle(20, state === 'learned' ? '#5be35b' : '#9aa3c7')).setOrigin(1, 0.5));
      return;
    }
    const b = SKILL_TREE.indexOf(branch);
    this.info.add(makeButton(this, 1135, 642, 150, 50, 'Learn', () => {
      Save.update((p) => { const h = activeHero(p); h.skills = [...learnedSkills(h), skill.id]; });
      this.scene.restart({ selected: { b, i } });
    }, { color: 0x2f8a4a, fontSize: 28 }));
  }
}
