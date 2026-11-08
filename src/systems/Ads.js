// Reward videos: watch one, get coins. A few per day.
// For now a short stand-in video plays. When the game is on Google Play, only show() changes:
// it will call the AdMob plugin (e.g. @capacitor-community/admob) and resolve true when the
// player watched to the end.
import { Save } from './Save.js';

export const AD_REWARD = 100;
export const ADS_PER_DAY = 3;

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
