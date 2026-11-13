import { HEROES } from '../data/hero.js';
import { weekOf, compareScores, formatTime, WEEK_PRIZES } from '../data/weekly.js';
import { drawMenuBackground, panel } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save, totalStars } from '../systems/Save.js';
import { Online } from '../systems/Online.js';
import { textStyle } from '../ui/theme.js';

// This week's Endless Battle board: more waves first, then the faster time. It starts again every
// Monday 10:00, and the top 20 win diamonds (see src/data/weekly.js).
// Online it shows everyone; with no internet it shows the players on this device.
export default class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('Leaderboard');
  }

  create() {
    drawMenuBackground(this);
    makeButton(this, 90, 40, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 36, 'Weekly Leaderboard', textStyle(48, '#ffd93b')).setOrigin(0.5);
    this.add.text(640, 80, 'Endless Battle - highest wave, then the fastest time. Top 20 win 💎 diamonds!',
      textStyle(21, '#c9d3ff')).setOrigin(0.5);
    this.clock = this.add.text(1240, 40, '', textStyle(20, '#7fe3ff')).setOrigin(1, 0.5);
    this.ends = weekOf().end;
    this.tick();
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.tick() });

    panel(this, 640, 400, 1000, 570);
    this.layer = this.add.container(0, 0);
    this.note = this.add.text(640, 700, '', textStyle(18, '#9aa3c7')).setOrigin(0.5);
    this.layer.add(this.add.text(640, 400, 'Loading...', textStyle(30, '#c9d3ff')).setOrigin(0.5));

    Online.leaderboard().then((res) => {
      if (!this.scene.isActive()) return;
      if (res?.ok) {
        if (res.ends) this.ends = res.ends;
        this.show(res.rows.map((r) => ({ ...r, hero: HEROES[r.hero]?.name ?? 'Zenko' })));
        this.note.setText('☁ Online - every player, on every device');
      } else {
        // The tester account never shows: it has everything, so it would not be fair
        const week = weekOf().id;
        this.show(Save.allPlayers().filter((p) => !p.super && p.week?.id === week).map((p) => ({
          name: p.name, wave: p.week.wave, time: p.week.time, stars: totalStars(p), hero: HEROES[p.activeHero]?.name ?? 'Zenko',
        })));
        this.note.setText('No internet - showing players on this device only');
      }
    });
  }

  // Time left until the new week
  tick() {
    const left = Math.max(0, Math.floor((this.ends - Date.now()) / 1000));
    const d = Math.floor(left / 86400);
    const h = Math.floor((left % 86400) / 3600);
    const m = Math.floor((left % 3600) / 60);
    this.clock.setText(`New week in ${d ? `${d}d ` : ''}${h}h ${m}m`);
    if (left === 0) this.time.delayedCall(3000, () => this.scene.restart());
  }

  show(all) {
    this.layer.removeAll(true);
    const me = Save.current()?.name?.toLowerCase();
    const rows = all.sort(compareScores).slice(0, WEEK_PRIZES.length);
    const cols = [195, 245, 640, 770, 900, 1060];
    ['#', 'Player', 'Wave', 'Time', 'Hero', 'Prize'].forEach((h, i) => {
      this.layer.add(this.add.text(cols[i], 135, h, textStyle(22, '#ffd93b')).setOrigin(i === 1 ? 0 : 0.5, 0.5));
    });
    if (!rows.length) {
      this.layer.add(this.add.text(640, 400, 'No scores this week yet - play Endless Battle!', textStyle(28)).setOrigin(0.5));
      return;
    }
    rows.forEach((r, i) => {
      const y = 165 + i * 26;
      const mine = r.name.toLowerCase() === me;
      if (mine) this.layer.add(this.add.rectangle(640, y, 960, 24, 0xffd93b, 0.15));
      const medal = ['#ffd93b', '#d4d8e6', '#d0884a'][i] ?? '#ffffff';
      this.layer.add([
        this.add.text(cols[0], y, `${i + 1}`, textStyle(20, medal)).setOrigin(0.5),
        this.add.text(cols[1], y, r.name, textStyle(20, mine ? '#5be35b' : '#ffffff')).setOrigin(0, 0.5),
        this.add.text(cols[2], y, `${r.wave}`, textStyle(20)).setOrigin(0.5),
        this.add.text(cols[3], y, formatTime(r.time), textStyle(20, '#c9d3ff')).setOrigin(0.5),
        this.add.text(cols[4], y, r.hero, textStyle(18, '#c9d3ff')).setOrigin(0.5),
        this.add.text(cols[5], y, `💎 ${WEEK_PRIZES[i]}`, textStyle(20, '#7fe3ff')).setOrigin(0.5),
      ]);
    });
  }
}
