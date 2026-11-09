import { HEROES, xpToNext, skillPoints, heroForm } from '../data/hero.js';
import { FORMS } from '../data/fighters.js';
import { fighterPortrait, formLook, gearLook } from '../art/fighterArt.js';
import { drawMenuBackground, panel, xpBar } from '../ui/menuBackground.js';
import { makeButton } from '../ui/Button.js';
import { Save, Sync, totalStars, activeHero, renameCost } from '../systems/Save.js';
import { Audio } from '../systems/Audio.js';
import { SHOP_STARS, ENDLESS_STARS, shopOpen, endlessOpen } from '../systems/Progress.js';
import { textStyle } from '../ui/theme.js';

export default class HubScene extends Phaser.Scene {
  constructor() {
    super('Hub');
  }

  create(data) {
    // A new version of the game is ready (see main.js)
    if (window.kdUpdateReady) {
      location.reload();
      return;
    }
    const player = Save.current();
    if (!player) {
      this.scene.start('Login');
      return;
    }
    Audio.music('menu');
    drawMenuBackground(this);

    // Top bar: name, stars, coins, settings and log out
    this.add.rectangle(0, 0, 1280, 64, 0x10131c, 0.85).setOrigin(0);
    this.add.text(24, 32, 'KI DEFENDERS', textStyle(38, '#ffd93b')).setOrigin(0, 0.5);
    this.add.text(330, 32, `★ ${totalStars(player)}`, textStyle(30, '#ffd93b')).setOrigin(0, 0.5);
    this.add.image(450, 32, 'coin');
    this.add.text(470, 32, `${player.coins}`, textStyle(30, '#ffd93b')).setOrigin(0, 0.5);
    this.add.text(928, 32, player.name, textStyle(30)).setOrigin(1, 0.5);
    makeButton(this, 954, 32, 36, 36, '✏️', () => this.renamePopup(player), { fontSize: 18, color: 0x3a4470 });
    makeButton(this, 1050, 32, 140, 44, 'Settings', () => this.scene.start('Settings', { back: 'Hub' }),
      { fontSize: 22, color: 0x3a4470 });
    makeButton(this, 1200, 32, 130, 44, 'Log out', () => {
      Save.logout();
      this.scene.start('Login');
    }, { fontSize: 22, color: 0x3a4470 });

    // Cloud status: is the progress saved online?
    const status = this.add.text(640, 690, '', textStyle(18, '#9aa3c7')).setOrigin(0.5);
    const showStatus = (st) => {
      const text = {
        online: ['☁ Progress saved online', '#5be35b'],
        pending: ['☁ Saving online...', '#ffd93b'],
        login: ['Saved on this device. Log out and back in with internet to save online.', '#ffb35b'],
        local: ['Tester account - saved on this device only', '#c9a8ff'],
        taken: ['This name belongs to another player online - progress is saved on this device only.', '#ff8a8a'],
      }[st];
      if (text) status.setText(text[0]).setColor(text[1]);
    };
    showStatus(Sync.status());
    const off = Sync.onChange(showStatus);
    this.events.once('shutdown', off);
    Sync.now();

    // Hero card: the hero in use right now
    const hero = activeHero(player);
    if (hero) this.heroCard(player, hero);
    else {
      panel(this, 330, 400, 500, 520);
      this.add.text(330, 250, 'No hero yet', textStyle(48, '#ffd93b')).setOrigin(0.5);
      this.add.text(330, 340, 'Your fighters defend the base alone\nfor now. Earn coins in battle and\nwin a hero in the Lucky Spin!',
        { ...textStyle(24), align: 'center' }).setOrigin(0.5);
      const open = shopOpen(player);
      const spin = makeButton(this, 330, 470, 360, 64, open ? 'Lucky Spin' : `Lucky Spin (needs ★ ${SHOP_STARS})`,
        () => this.scene.start('Shop', { tab: 'spin' }), { color: 0xc99a00, fontSize: open ? 30 : 24 });
      spin.setEnabled(open);
    }
    this.buttons(player, hero);
    this.dailyReward();

    if (data && data.welcome) {
      const t = this.add.text(830, 660, data.welcome, textStyle(30, '#5be35b')).setOrigin(0.5);
      this.tweens.add({ targets: t, alpha: 0, delay: 2200, duration: 600 });
    }
  }

  // Change name: the first time is free, then it costs coins (see Save.rename)
  renamePopup(player) {
    const cost = renameCost(player);
    const pop = this.add.container(0, 0).setDepth(300);
    pop.add(this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6).setOrigin(0).setInteractive());
    pop.add(panel(this, 640, 360, 560, 360, 0xffd93b));
    pop.add(this.add.text(640, 225, 'Change your name', textStyle(44, '#ffd93b')).setOrigin(0.5));
    pop.add(this.add.text(640, 272, cost ? `This costs ${cost} coins (you have ${player.coins})` : 'Your first name change is free!',
      textStyle(22, cost ? '#ffe9c4' : '#5be35b')).setOrigin(0.5));
    const form = this.add.dom(640, 340).createFromHTML(`
      <form class="kd-login" autocomplete="off" style="width: 400px; gap: 8px">
        <input class="kd-input" name="name" maxlength="12" placeholder="New name" />
        <div class="kd-error"></div>
      </form>`).setDepth(301);
    const el = form.node.querySelector('form');
    const input = el.querySelector('input');
    const error = el.querySelector('.kd-error');
    input.value = player.name;
    input.addEventListener('input', () => { error.textContent = ''; });
    const close = () => {
      form.destroy();
      pop.destroy(true);
    };
    let busy = false;
    const go = async () => {
      if (busy) return;
      busy = true;
      error.textContent = '';
      const res = await Save.rename(input.value);
      busy = false;
      if (!res.ok) {
        error.textContent = res.error;
        return;
      }
      close();
      this.scene.restart({ welcome: `You are now ${res.name}!` });
    };
    el.addEventListener('submit', (e) => {
      e.preventDefault();
      go();
    });
    pop.add(makeButton(this, 540, 470, 180, 56, 'Cancel', close, { color: 0x3a4470, fontSize: 26, depth: 301 }));
    pop.add(makeButton(this, 740, 470, 180, 56, 'Change', go, { color: 0x2f8a4a, fontSize: 26, depth: 301 }));
    input.focus();
    input.select();
  }

  // Daily reward: coins for the first visit each day, more for days in a row (up to 7)
  dailyReward() {
    const day = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const today = day(new Date());
    const yesterday = day(new Date(Date.now() - 86400000));
    const gift = Save.update((p) => {
      if (p.daily.last === today) return null;
      const streak = p.daily.last === yesterday ? Math.min(7, p.daily.streak + 1) : 1;
      const coins = 50 + 25 * (streak - 1);
      p.daily = { last: today, streak };
      p.coins += coins;
      return { streak, coins };
    });
    if (!gift) return;
    Audio.sfx('coin');
    const pop = this.add.container(0, 0).setDepth(300);
    pop.add(this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6).setOrigin(0).setInteractive());
    pop.add(panel(this, 640, 360, 560, 320, 0xffd93b));
    pop.add(this.add.text(640, 255, 'Daily reward!', textStyle(52, '#ffd93b')).setOrigin(0.5));
    pop.add(this.add.text(640, 320, `Day ${gift.streak} in a row`, textStyle(28, '#c9d3ff')).setOrigin(0.5));
    pop.add(this.add.image(580, 375, 'coin').setScale(1.6));
    pop.add(this.add.text(610, 375, `+${gift.coins} coins`, textStyle(40, '#ffd93b')).setOrigin(0, 0.5));
    pop.add(this.add.text(640, 420, 'Come back tomorrow for more (up to 200 a day)', textStyle(20, '#9aa3c7')).setOrigin(0.5));
    pop.add(makeButton(this, 640, 475, 200, 56, 'Collect', () => this.scene.restart(), { color: 0x2f8a4a, fontSize: 30, depth: 301 }));
  }

  heroCard(player, hero) {
    const def = HEROES[player.activeHero];
    panel(this, 330, 400, 500, 520, def.look.gi);
    const art = fighterPortrait(this, 330, 290, { ...formLook(def.look, heroForm(hero)), ...gearLook(hero.gear) },
      3.6, `hero_${player.activeHero}_${heroForm(hero)}`);
    this.tweens.add({ targets: art, y: art.y - 8, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.text(330, 440, def.name, textStyle(48)).setOrigin(0.5);
    this.add.text(330, 482, def.title, textStyle(22, '#c9d3ff')).setOrigin(0.5);
    this.add.text(330, 522, `Level ${hero.level}`, textStyle(32, '#ffd93b')).setOrigin(0.5);
    const need = xpToNext(hero.level);
    xpBar(this, 150, 550, 360, 22, hero.xp / need);
    this.add.text(330, 590, `XP ${hero.xp} / ${need}`, textStyle(22, '#c9d3ff')).setOrigin(0.5);
    const sp = skillPoints(hero);
    this.add.text(330, 626, `Skill points: ${sp}`, textStyle(24, sp > 0 ? '#5be35b' : '#c9d3ff')).setOrigin(0.5);
  }

  buttons(player, hero) {

    // Main buttons
    makeButton(this, 830, 190, 420, 100, 'Play', () => this.scene.start('LevelSelect'), { color: 0xe0661a, fontSize: 56 });
    makeButton(this, 722, 300, 204, 76, 'Heroes', () => this.scene.start('Hero'), { color: 0xb8303a, fontSize: 34 });
    makeButton(this, 938, 300, 204, 76, 'Fighters', () => this.scene.start('Fighters'), { color: 0x2f6ab8, fontSize: 34 });
    const shop = makeButton(this, 722, 392, 204, 76, shopOpen(player) ? 'Shop' : `Shop  ★ ${SHOP_STARS}`,
      () => this.scene.start('Shop'), { color: 0x2f8a4a, fontSize: shopOpen(player) ? 36 : 28 });
    makeButton(this, 938, 392, 204, 76, 'Base', () => this.scene.start('Base'), { color: 0x8a6a2a, fontSize: 34 });
    shop.setEnabled(shopOpen(player));
    const endless = makeButton(this, 830, 484, 420, 76,
      endlessOpen(player) ? `Endless Battle  (best: wave ${player.endlessBest})` : `Endless Battle  (needs ★ ${ENDLESS_STARS})`,
      () => this.scene.start('Game', { levelId: 'endless', difficulty: 'normal' }), { color: 0x6a3ab8, fontSize: 28 });
    endless.setEnabled(endlessOpen(player));
    makeButton(this, 830, 576, 420, 76, 'Leaderboard', () => this.scene.start('Leaderboard'), { fontSize: 32 });
    makeButton(this, 1160, 690, 200, 44, '💡 Tips & bugs', () => this.scene.start('Feedback'), { fontSize: 22, color: 0x3a4470 });
    if (hero && skillPoints(hero) > 0) {
      const dot = this.add.circle(808, 278, 14, 0x5be35b).setStrokeStyle(3, 0x10131c).setDepth(120);
      this.add.text(808, 278, '!', textStyle(20)).setOrigin(0.5).setDepth(121);
      this.tweens.add({ targets: dot, scale: 1.2, duration: 500, yoyo: true, repeat: -1 });
    }
  }
}
