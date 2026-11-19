import { drawMenuBackground, panel, xpBar } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save } from '../systems/Save.js';
import { Audio } from '../systems/Audio.js';
import { textStyle } from '../ui/theme.js';
import { DAILY_GIFTS, BADGES, QUEST_BONUS } from '../data/rewards.js';
import {
  dayKey, giftDay, todayQuests, claimQuest, claimQuestBonus, badgeStat, badgeReady, claimBadge,
} from '../systems/Rewards.js';

const BADGES_A_PAGE = 12;

// The 7-day gift calendar, drawn into `layer` around y. Days before `day` are done, `day` is today.
export function drawCalendar(scene, layer, y, streak, today = true) {
  const day = giftDay(streak);
  DAILY_GIFTS.forEach((gift, i) => {
    const x = 640 + (i - 3) * 150;
    const done = i < day || (i === day && today);
    const now = i === day;
    const g = scene.add.graphics();
    const big = i === DAILY_GIFTS.length - 1;
    g.fillStyle(now ? 0x2f5a3a : big ? 0x2a3a6a : 0x1c2236, 0.95).fillRoundedRect(x - 66, y - 80, 132, 160, 14);
    g.lineStyle(now ? 5 : 3, now ? 0x5be35b : big ? 0x7fe3ff : 0x3a4470).strokeRoundedRect(x - 66, y - 80, 132, 160, 14);
    layer.add(g);
    layer.add(scene.add.text(x, y - 58, `Day ${i + 1}`, textStyle(22, now ? '#5be35b' : '#c9d3ff')).setOrigin(0.5));
    if (gift.diamonds) {
      layer.add(scene.add.text(x, y - 12, '💎', { fontSize: '40px' }).setOrigin(0.5));
      layer.add(scene.add.text(x, y + 28, `+${gift.diamonds}`, textStyle(26, '#7fe3ff')).setOrigin(0.5));
      layer.add(scene.add.text(x, y + 56, `+${gift.coins} coins`, textStyle(17, '#ffd93b')).setOrigin(0.5));
    } else {
      layer.add(scene.add.image(x, y - 10, 'coin').setScale(1.7));
      layer.add(scene.add.text(x, y + 36, `${gift.coins}`, textStyle(28, '#ffd93b')).setOrigin(0.5));
    }
    if (done) {
      layer.add(scene.add.rectangle(x, y, 132, 160, 0x000000, 0.45));
      layer.add(scene.add.text(x, y, '✓', textStyle(64, '#5be35b')).setOrigin(0.5));
    }
  });
}

// A round medal for a badge: bronze, silver, gold or diamond by how many diamonds it pays
function medal(scene, x, y, b, got) {
  const color = b.diamonds >= 15 ? 0x7fe3ff : b.diamonds >= 8 ? 0xffd93b : b.diamonds >= 5 ? 0xd8dde8 : 0xc98a3a;
  const g = scene.add.graphics();
  g.fillStyle(0xb8303a).fillTriangle(x - 16, y + 6, x - 4, y + 6, x - 16, y + 36);
  g.fillStyle(0x2f6ab8).fillTriangle(x + 16, y + 6, x + 4, y + 6, x + 16, y + 36);
  g.fillStyle(0x10131c).fillCircle(x, y, 27);
  g.fillStyle(got ? color : 0x3a4052).fillCircle(x, y, 24);
  g.fillStyle(0xffffff, got ? 0.35 : 0.1).fillCircle(x - 7, y - 8, 8);
  return g;
}

// Rewards: the daily gift calendar, today's quests and the badges
export default class RewardsScene extends Phaser.Scene {
  constructor() {
    super('Rewards');
  }

  create(data = {}) {
    drawMenuBackground(this);
    makeButton(this, 90, 40, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 40, 'Rewards', textStyle(48, '#ffd93b')).setOrigin(0.5);
    this.add.image(1010, 40, 'coin');
    this.coinText = this.add.text(1030, 40, '', textStyle(30, '#ffd93b')).setOrigin(0, 0.5);
    this.add.text(1150, 40, '💎', { fontSize: '26px' }).setOrigin(0.5);
    this.diamondText = this.add.text(1170, 40, '', textStyle(30, '#7fe3ff')).setOrigin(0, 0.5);
    // Today's quests are picked the first time they are needed
    if (Save.current()?.quests?.day !== dayKey()) Save.update((p) => { todayQuests(p); });
    this.tabs = ['daily', 'quests', 'badges'].map((t, i) => makeButton(this, 390 + i * 250, 115, 230, 54,
      ['🎁 Daily gift', '📜 Quests', '🏅 Badges'][i], () => this.show(t), { fontSize: 26, color: 0x2a3350 }));
    this.dots = [];
    this.layer = this.add.container(0, 0);
    this.badgePage = 0;
    this.show(data.tab ?? 'quests');
  }

  refreshTop() {
    const p = Save.current();
    this.coinText.setText(`${p.coins}`);
    this.diamondText.setText(`${p.diamonds}`);
    this.dots.forEach((d) => d.destroy());
    const quests = p.quests?.list ?? [];
    const waiting = [
      false,
      quests.some((q) => !q.claimed && q.have >= q.need) || (!p.quests?.bonus && quests.length && quests.every((q) => q.claimed)),
      BADGES.some((b) => badgeReady(p, b)),
    ];
    this.dots = waiting.flatMap((w, i) => (w ? [this.add.circle(390 + i * 250 + 105, 92, 11, 0x5be35b).setDepth(120)] : []));
  }

  show(tab) {
    this.tab = tab;
    this.tabs.forEach((b, i) => b.setAlpha(['daily', 'quests', 'badges'][i] === tab ? 1 : 0.6));
    this.layer.removeAll(true);
    this.refreshTop();
    if (tab === 'daily') this.showDaily();
    else if (tab === 'quests') this.showQuests();
    else this.showBadges();
  }

  showDaily() {
    const L = this.layer;
    const p = Save.current();
    const today = p.daily.last === dayKey();
    L.add(panel(this, 640, 420, 1160, 500));
    L.add(this.add.text(640, 210, 'A gift every day you play!', textStyle(36, '#ffd93b')).setOrigin(0.5));
    L.add(this.add.text(640, 252, 'Come back every day for bigger gifts. Day 7 gives diamonds!', textStyle(22, '#c9d3ff')).setOrigin(0.5));
    drawCalendar(this, L, 400, Math.max(1, p.daily.streak), today);
    const next = DAILY_GIFTS[giftDay(p.daily.streak + 1)];
    L.add(this.add.text(640, 530, `${p.daily.streak} day${p.daily.streak === 1 ? '' : 's'} in a row`, textStyle(30, '#5be35b')).setOrigin(0.5));
    L.add(this.add.text(640, 575, `Tomorrow: ${next.coins} coins${next.diamonds ? ` and ${next.diamonds} 💎` : ''}`
      + '  -  miss a day and it starts again from day 1', textStyle(20, '#9aa3c7')).setOrigin(0.5));
  }

  showQuests() {
    const L = this.layer;
    const quests = Save.current().quests;
    L.add(this.add.text(640, 175, `New quests every day  -  ${this.timeLeft()} left`, textStyle(22, '#9aa3c7')).setOrigin(0.5));
    quests.list.forEach((q, i) => {
      const y = 260 + i * 120;
      const ready = !q.claimed && q.have >= q.need;
      L.add(panel(this, 640, y, 1000, 104, q.claimed ? 0x3a4470 : ready ? 0x5be35b : 0xffd93b));
      L.add(this.add.text(170, y - 22, q.text, textStyle(30, q.claimed ? '#9aa3c7' : '#ffffff')).setOrigin(0, 0.5));
      L.add(xpBar(this, 170, y + 12, 520, 20, q.have / q.need, ready || q.claimed ? 0x5be35b : 0x3fd0f5));
      L.add(this.add.text(705, y + 22, `${q.have} / ${q.need}`, textStyle(22, '#c9d3ff')).setOrigin(0, 0.5));
      L.add(this.add.image(850, y, 'coin').setScale(1.2));
      L.add(this.add.text(872, y, `${q.coins}`, textStyle(30, '#ffd93b')).setOrigin(0, 0.5));
      if (q.claimed) L.add(this.add.text(1050, y, '✓ Done', textStyle(30, '#5be35b')).setOrigin(0.5));
      else {
        const b = makeButton(this, 1050, y, 150, 56, 'Collect', () => this.collect((p) => claimQuest(p, i), 'coins'),
          { fontSize: 26, color: 0x2f8a4a });
        b.setEnabled(ready);
        L.add(b);
      }
    });
    // All three done: diamonds
    const all = quests.list.every((q) => q.claimed);
    const y = 625;
    L.add(panel(this, 640, y, 1000, 80, 0x7fe3ff));
    L.add(this.add.text(170, y, `Finish all ${quests.list.length} quests:`, textStyle(28)).setOrigin(0, 0.5));
    L.add(this.add.text(560, y, `💎 +${QUEST_BONUS}`, textStyle(32, '#7fe3ff')).setOrigin(0, 0.5));
    if (quests.bonus) L.add(this.add.text(1050, y, '✓ Done', textStyle(30, '#5be35b')).setOrigin(0.5));
    else {
      const b = makeButton(this, 1050, y, 150, 56, 'Collect', () => this.collect((p) => claimQuestBonus(p), 'diamonds'),
        { fontSize: 26, color: 0x2a7fa8 });
      b.setEnabled(all);
      L.add(b);
    }
  }

  showBadges() {
    const L = this.layer;
    const p = Save.current();
    // Ready to collect first, then the closest to done, then the ones already collected
    const order = (b) => (badgeReady(p, b) ? 2 : p.badges.includes(b.id) ? -1 : Math.min(1, badgeStat(p, b.stat) / b.need));
    const list = [...BADGES].sort((a, b) => order(b) - order(a));
    const pages = Math.ceil(list.length / BADGES_A_PAGE);
    this.badgePage = Math.min(this.badgePage, pages - 1);
    L.add(this.add.text(640, 175, `${p.badges.length} / ${BADGES.length} badges collected`, textStyle(24, '#c9d3ff')).setOrigin(0.5));
    list.slice(this.badgePage * BADGES_A_PAGE, (this.badgePage + 1) * BADGES_A_PAGE).forEach((b, i) => {
      const x = 205 + (i % 4) * 290;
      const y = 280 + Math.floor(i / 4) * 150;
      const got = p.badges.includes(b.id);
      const ready = badgeReady(p, b);
      const have = Math.min(b.need, badgeStat(p, b.stat));
      L.add(panel(this, x, y, 276, 136, got ? 0x3a4470 : ready ? 0x5be35b : 0x2a3350));
      L.add(medal(this, x - 100, y - 18, b, got || ready));
      L.add(this.add.text(x - 62, y - 42, b.name, textStyle(22, got ? '#9aa3c7' : '#ffd93b')).setOrigin(0, 0.5));
      L.add(this.add.text(x - 62, y - 8, b.text, { ...textStyle(16, '#c9d3ff'), wordWrap: { width: 190 } }).setOrigin(0, 0.5));
      if (got) L.add(this.add.text(x, y + 40, `✓ Collected  💎 ${b.diamonds}`, textStyle(20, '#5be35b')).setOrigin(0.5));
      else if (ready) {
        L.add(makeButton(this, x, y + 40, 200, 40, `Collect 💎 ${b.diamonds}`, () => this.collect((q) => claimBadge(q, b.id), 'diamonds'),
          { fontSize: 20, color: 0x2a7fa8 }));
      } else {
        L.add(xpBar(this, x - 125, y + 32, 170, 16, have / b.need));
        L.add(this.add.text(x + 52, y + 40, `💎 ${b.diamonds}`, textStyle(20, '#7fe3ff')).setOrigin(0, 0.5));
        L.add(this.add.text(x - 40, y + 56, `${have} / ${b.need}`, textStyle(15, '#9aa3c7')).setOrigin(0.5));
      }
    });
    if (pages > 1) {
      const prev = makeButton(this, 520, 690, 120, 44, '<', () => { this.badgePage--; this.show('badges'); }, { fontSize: 26, color: 0x3a4470 });
      const next = makeButton(this, 760, 690, 120, 44, '>', () => { this.badgePage++; this.show('badges'); }, { fontSize: 26, color: 0x3a4470 });
      prev.setEnabled(this.badgePage > 0);
      next.setEnabled(this.badgePage < pages - 1);
      L.add([prev, next, this.add.text(640, 690, `${this.badgePage + 1} / ${pages}`, textStyle(24, '#c9d3ff')).setOrigin(0.5)]);
    }
  }

  // Pays a reward (claim returns how much was paid) and shows it
  collect(claim, kind) {
    let got = 0;
    Save.update((p) => { got = claim(p); });
    if (!got) return;
    Audio.sfx(kind === 'diamonds' ? 'win' : 'coin');
    this.show(this.tab);
    const t = this.add.text(640, 700, kind === 'diamonds' ? `💎 +${got} diamonds!` : `+${got} coins!`,
      textStyle(36, kind === 'diamonds' ? '#7fe3ff' : '#ffd93b')).setOrigin(0.5).setDepth(150);
    this.tweens.add({ targets: t, y: 676, alpha: 0, delay: 900, duration: 700, onComplete: () => t.destroy() });
  }

  // Time until the quests change (midnight)
  timeLeft() {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const min = Math.ceil((end - now) / 60000);
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  }
}
