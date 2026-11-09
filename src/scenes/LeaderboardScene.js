import { HEROES } from '../data/hero.js';
import { drawMenuBackground, panel } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save, totalStars } from '../systems/Save.js';
import { Online } from '../systems/Online.js';
import { textStyle } from '../ui/theme.js';

// Best Endless Battle wave of every player. Online it shows everyone;
// with no internet it shows the players on this device.
export default class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('Leaderboard');
  }

  create() {
    drawMenuBackground(this);
    makeButton(this, 90, 40, 140, 50, '< Back', () => this.scene.start('Hub'), { fontSize: 26, color: 0x3a4470 });
    this.add.text(640, 40, 'Leaderboard', textStyle(52, '#ffd93b')).setOrigin(0.5);
    this.add.text(640, 92, 'Endless Battle - highest wave reached', textStyle(24, '#c9d3ff')).setOrigin(0.5);
    panel(this, 640, 400, 900, 520);
    this.layer = this.add.container(0, 0);
    this.note = this.add.text(640, 690, '', textStyle(20, '#9aa3c7')).setOrigin(0.5);
    this.layer.add(this.add.text(640, 400, 'Loading...', textStyle(30, '#c9d3ff')).setOrigin(0.5));

    Online.leaderboard().then((res) => {
      if (!this.scene.isActive()) return;
      if (res?.ok) {
        this.show(res.rows.map((r) => ({ ...r, hero: HEROES[r.hero]?.name ?? 'Zenko' })));
        this.note.setText('☁ Online - every player, on every device');
      } else {
        // The tester account never shows: it has everything, so it would not be fair
        this.show(Save.allPlayers().filter((p) => !p.super).map((p) => ({
          name: p.name, wave: p.endlessBest, stars: totalStars(p), hero: HEROES[p.activeHero]?.name ?? 'Zenko',
        })));
        this.note.setText('No internet - showing players on this device only');
      }
    });
  }

  show(all) {
    this.layer.removeAll(true);
    const me = Save.current()?.name?.toLowerCase();
    const rows = all.sort((a, b) => b.wave - a.wave || b.stars - a.stars).slice(0, 10);
    const cols = [250, 340, 700, 880, 1030];
    ['#', 'Player', 'Best wave', 'Stars', 'Hero'].forEach((h, i) => {
      this.layer.add(this.add.text(cols[i], 175, h, textStyle(24, '#ffd93b')).setOrigin(i === 1 ? 0 : 0.5, 0.5));
    });
    if (!rows.length) this.layer.add(this.add.text(640, 400, 'No scores yet - play Endless Battle!', textStyle(28)).setOrigin(0.5));
    rows.forEach((r, i) => {
      const y = 222 + i * 42;
      const mine = r.name.toLowerCase() === me;
      if (mine) this.layer.add(this.add.rectangle(640, y, 860, 38, 0xffd93b, 0.15));
      const medal = ['#ffd93b', '#d4d8e6', '#d0884a'][i] ?? '#ffffff';
      this.layer.add([
        this.add.text(cols[0], y, `${i + 1}`, textStyle(26, medal)).setOrigin(0.5),
        this.add.text(cols[1], y, r.name, textStyle(26, mine ? '#5be35b' : '#ffffff')).setOrigin(0, 0.5),
        this.add.text(cols[2], y, r.wave > 0 ? `${r.wave}` : '-', textStyle(26)).setOrigin(0.5),
        this.add.text(cols[3], y, `★ ${r.stars}`, textStyle(24, '#ffd93b')).setOrigin(0.5),
        this.add.text(cols[4], y, r.hero, textStyle(22, '#c9d3ff')).setOrigin(0.5),
      ]);
    });
  }
}
