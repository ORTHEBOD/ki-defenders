// Ads. Two kinds:
// - Reward videos in the shop: watch one, get coins. A few per day.
// - A short ad between battles that every player sees (no reward).
// The Android app shows real AdMob ads (@capacitor-community/admob, ad units in src/data/ads.js).
// The website and the PC app show the game's own stand-in screens instead.
import { Save } from './Save.js';
import { AD_UNITS, TEST_ADS } from '../data/ads.js';

export const AD_REWARD = 100;
export const ADS_PER_DAY = 3;
// Ads between battles: at most one every 5 minutes, and none after the first levels
const BREAK_GAP = 5 * 60 * 1000;
const FREE_LEVELS = 5;
let lastBreak = 0;

// ---------- AdMob (Android app) ----------

const admob = () => (window.Capacitor?.isNativePlatform?.() ? window.Capacitor?.Plugins?.AdMob : null);

// Starts AdMob once, and asks for ad consent where the law requires it (EU and UK)
let started = null;
function startAdMob() {
  const A = admob();
  if (!A) return Promise.resolve(false);
  started ??= (async () => {
    try {
      await A.initialize({ initializeForTesting: TEST_ADS });
      const consent = await A.requestConsentInfo();
      if (consent.isConsentFormAvailable && consent.status === 'REQUIRED') await A.showConsentForm();
      return true;
    } catch (e) {
      console.warn('AdMob could not start', e);
      started = null;
      return false;
    }
  })();
  return started;
}

// Waits for the first of these plugin events (or the time limit); resolves with the event's name
async function firstEvent(names, ms) {
  const A = admob();
  const handles = [];
  let timer;
  const result = await new Promise((resolve) => {
    timer = setTimeout(() => resolve('timeout'), ms);
    names.forEach((name) => A.addListener(name, () => resolve(name)).then((h) => handles.push(h)));
  });
  clearTimeout(timer);
  handles.forEach((h) => h.remove());
  return result;
}

// A full-screen ad between battles. Resolves when it is closed, failed or took too long to load.
async function nativeInterstitial() {
  if (!(await startAdMob())) return;
  const A = admob();
  try {
    await Promise.race([A.prepareInterstitial({ adId: AD_UNITS.interstitial, isTesting: TEST_ADS }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('slow')), 6000))]);
    const closed = firstEvent(['interstitialAdDismissed', 'interstitialAdFailedToShow'], 120000);
    await A.showInterstitial();
    await closed;
  } catch (e) {
    console.warn('No ad between battles', e);
  }
}

// A reward video. Resolves true only when the player watched it to the end.
async function nativeRewarded() {
  if (!(await startAdMob())) return null;
  const A = admob();
  try {
    await A.prepareRewardVideoAd({ adId: AD_UNITS.rewarded, isTesting: TEST_ADS });
    let rewarded = false;
    const reward = A.addListener('onRewardedVideoAdReward', () => { rewarded = true; });
    const closed = firstEvent(['onRewardedVideoAdDismissed', 'onRewardedVideoAdFailedToShow'], 180000);
    A.showRewardVideoAd().then(() => { rewarded = true; }).catch(() => {});
    await closed;
    (await reward).remove();
    return rewarded;
  } catch (e) {
    console.warn('No reward video', e);
    return null;
  }
}

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
  async show(scene) {
    if (admob()) {
      const watched = await nativeRewarded();
      if (watched === null) {
        const t = scene.add.text(640, 600, 'No video right now - try again later', { fontFamily: 'Bangers, Arial Black', fontSize: '30px', color: '#ff6b6b' })
          .setOrigin(0.5).setDepth(400);
        scene.tweens.add({ targets: t, alpha: 0, delay: 1800, duration: 400, onComplete: () => t.destroy() });
      }
      return !!watched;
    }
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
    if (admob()) {
      nativeInterstitial().then(next);
      return;
    }
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
