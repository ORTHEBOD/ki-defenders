// Ads. Two kinds:
// - Reward videos in the shop: watch one, get coins. A few per day.
// - A short ad between battles that every player sees (no reward).
// For now stand-in screens play. When the game is on Google Play, show() and between() will call
// the AdMob plugin (e.g. @capacitor-community/admob): a rewarded ad and an interstitial ad.
import { Save } from './Save.js';

export const AD_REWARD = 100;
export const ADS_PER_DAY = 3;
// Ads between battles: at most one every 5 minutes, and none after the first levels
const BREAK_GAP = 5 * 60 * 1000;
const FREE_LEVELS = 5;
let lastBreak = 0;

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export const Ads = {
  // Videos the player can still watch today
  left(player) {
    const a = player.ads;
    return a && a.day === today() ? Math.max(0, ADS_PER_DAY - a.count) : ADS_PER_DAY;
  },

  // Plays a video; resolves true when it was watched to the end
  show(scene) {
    return new Promise((resolve) => {
      const SECONDS = 5;
      const pop = scene.add.container(0, 0).setDepth(400);
      pop.add(scene.add.rectangle(0, 0, 1280, 720, 0x000000, 0.92).setOrigin(0).setInteractive());
      pop.add(scene.add.text(640, 300, '🎬', { fontSize: '96px' }).setOrigin(0.5));
      pop.add(scene.add.text(640, 400, 'Video playing...', { fontFamily: 'Bangers, Arial Black', fontSize: '40px', color: '#ffffff' }).setOrigin(0.5));
      const count = scene.add.text(640, 460, `${SECONDS}`, { fontFamily: 'Bangers, Arial Black', fontSize: '48px', color: '#ffd93b' }).setOrigin(0.5);
      pop.add(count);
      let left = SECONDS;
      scene.time.addEvent({
        delay: 1000,
        repeat: SECONDS - 1,
        callback: () => {
          left -= 1;
          count.setText(`${left}`);
          if (left === 0) {
            pop.destroy();
            resolve(true);
          }
        },
      });
    });
  },

  // A short ad between battles (no reward, does not use up the shop's reward videos).
  // Runs `next` when it is done. At most one every BREAK_GAP, none in levels 1 to FREE_LEVELS,
  // and never for the tester account.
  between(scene, next) {
    const player = Save.current();
    const early = !scene.endless && scene.level?.id <= FREE_LEVELS;
    if (!player || player.super || early || Date.now() - lastBreak < BREAK_GAP) {
      next();
      return;
    }
    lastBreak = Date.now();
    const SKIP_AFTER = 5;
    const pop = scene.add.container(0, 0).setDepth(500);
    pop.add(scene.add.rectangle(0, 0, 1280, 720, 0x000000, 0.95).setOrigin(0).setInteractive());
    pop.add(scene.add.text(640, 320, '📺', { fontSize: '90px' }).setOrigin(0.5));
    pop.add(scene.add.text(640, 420, 'Advertisement', { fontFamily: 'Bangers, Arial Black', fontSize: '40px', color: '#ffffff' }).setOrigin(0.5));
    const close = scene.add.text(1200, 60, `${SKIP_AFTER}`, { fontFamily: 'Bangers, Arial Black', fontSize: '36px', color: '#9aa3c7' }).setOrigin(0.5);
    pop.add(close);
    let left = SKIP_AFTER;
    scene.time.addEvent({
      delay: 1000,
      repeat: SKIP_AFTER - 1,
      callback: () => {
        left -= 1;
        if (left > 0) {
          close.setText(`${left}`);
          return;
        }
        // The player can close the ad now
        close.setText('✕  Close').setColor('#ffffff').setInteractive({ useHandCursor: true });
        close.on('pointerdown', () => {
          pop.destroy();
          next();
        });
      },
    });
  },

  // Counts the video and pays the reward. Returns false if today's videos are used up.
  reward() {
    return Save.update((p) => {
      if (Ads.left(p) <= 0) return false;
      const a = p.ads && p.ads.day === today() ? p.ads : { day: today(), count: 0 };
      p.ads = { day: a.day, count: a.count + 1 };
      p.coins += AD_REWARD;
      return true;
    });
  },
};
