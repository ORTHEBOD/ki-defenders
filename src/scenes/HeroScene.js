import { HERO, xpToNext, skillPoints, learnedSkills, heroPower, heroMaxHp } from '../data/hero.js';
import { fighterPortrait } from '../art/fighterArt.js';
import { drawMenuBackground, panel, xpBar } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save } from '../systems/Save.js';
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
    const hero = player.hero;
    this.learned = new Set(learnedSkills(hero));
    this.points = skillPoints(hero);
    drawMenuBackground(this);
    makeButton(this, 90, 50, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 50, 'Hero', textStyle(56, '#ffd93b')).setOrigin(0.5);
    if (this.learned.size > 0) {
      makeButton(this, 1150, 50, 200, 50, 'Reset skills', () => {
        Save.update((p) => { p.hero.skills = []; });
        this.scene.restart();
      }, { fontSize: 24, color: 0x8a2f3a });
    }

    // Hero info
    panel(this, 230, 400, 360, 540, 0xd8442b);
    fighterPortrait(this, 230, 250, HERO.look, 3.2);
    this.add.text(230, 390, HERO.name, textStyle(44)).setOrigin(0.5);
    this.add.text(230, 436, `Level ${hero.level}`, textStyle(30, '#ffd93b')).setOrigin(0.5);
    const need = xpToNext(hero.level);
    xpBar(this, 90, 466, 280, 20, hero.xp / need);
    this.add.text(230, 504, `XP ${hero.xp} / ${need}`, textStyle(20, '#c9d3ff')).setOrigin(0.5);
    const dmg = Math.round(HERO.base.damage * heroPower(hero.level));
    this.add.text(230, 540, `HP ${heroMaxHp(hero.level)}    Damage ${dmg}`, textStyle(22)).setOrigin(0.5);
    this.add.text(230, 584, `Skill points: ${this.points}`, textStyle(28, this.points > 0 ? '#5be35b' : '#c9d3ff')).setOrigin(0.5);
    this.add.text(230, 625, 'Win levels to earn XP. 1 point per level.', textStyle(17, '#9aa3c7')).setOrigin(0.5);

    // Skill tree: 3 branches, learned top to bottom
    panel(this, 820, 400, 820, 540);
    this.add.text(820, 160, 'Skill tree', textStyle(34)).setOrigin(0.5);
    HERO.skillTree.forEach((branch, b) => {
      const x = 560 + b * 260;
      this.add.text(x, 205, branch.branch, textStyle(28, hex(branch.color))).setOrigin(0.5);
      this.add.graphics().lineStyle(4, branch.color, 0.35).lineBetween(x, 250, x, 520);
      branch.skills.forEach((skill, i) => {
        const y = 250 + i * 88;
        const state = this.skillState(branch, i);
        const fill = state === 'learned' ? branch.color : 0x10131c;
        const node = this.add.circle(x, y, 26, fill).setStrokeStyle(4, branch.color, state === 'locked' ? 0.35 : 1);
        const icon = state === 'learned' ? '✔' : state === 'ready' ? '+' : '🔒';
        this.add.text(x, y, icon, state === 'locked' ? { fontSize: '20px' } : textStyle(26, state === 'learned' ? '#10131c' : '#5be35b'))
          .setOrigin(0.5).setAlpha(state === 'locked' ? 0.6 : 1);
        this.add.text(x, y + 38, skill.name, textStyle(19, state === 'locked' ? '#8a91ad' : '#ffffff')).setOrigin(0.5);
        if (state === 'ready') this.tweens.add({ targets: node, scale: 1.12, duration: 600, yoyo: true, repeat: -1 });
        node.setInteractive({ useHandCursor: true });
        node.on('pointerdown', () => this.showSkill(branch, i));
      });
    });

    this.info = this.add.container(0, 0);
    const sel = data.selected;
    if (sel) this.showSkill(HERO.skillTree[sel.b], sel.i);
    else this.info.add(this.add.text(820, 618, 'Tap a skill to see what it does', textStyle(22, '#ffe9c4')).setOrigin(0.5));
  }

  // learned / ready (can learn now) / next (needs a point) / locked (learn the one above first)
  skillState(branch, i) {
    const skill = branch.skills[i];
    if (this.learned.has(skill.id)) return 'learned';
    const prevDone = i === 0 || this.learned.has(branch.skills[i - 1].id);
    if (!prevDone) return 'locked';
    return this.points > 0 ? 'ready' : 'next';
  }

  showSkill(branch, i) {
    this.info.removeAll(true);
    const skill = branch.skills[i];
    const state = this.skillState(branch, i);
    this.info.add(this.add.rectangle(820, 625, 790, 74, 0x10131c, 1));
    this.info.add(this.add.text(450, 610, skill.name, textStyle(24, hex(branch.color))).setOrigin(0, 0.5));
    this.info.add(this.add.text(450, 640, skill.desc, textStyle(19, '#ffffff')).setOrigin(0, 0.5));

    let status = '';
    if (state === 'learned') status = 'Learned';
    else if (state === 'locked') status = `Learn ${branch.skills[i - 1].name} first`;
    else if (state === 'next') status = 'Needs 1 skill point';
    if (status) {
      this.info.add(this.add.text(1195, 625, status, textStyle(20, state === 'learned' ? '#5be35b' : '#9aa3c7')).setOrigin(1, 0.5));
      return;
    }
    const b = HERO.skillTree.indexOf(branch);
    this.info.add(makeButton(this, 1110, 625, 160, 50, 'Learn', () => {
      Save.update((p) => { p.hero.skills = [...learnedSkills(p.hero), skill.id]; });
      this.scene.restart({ selected: { b, i } });
    }, { color: 0x2f8a4a, fontSize: 28 }));
  }
}
