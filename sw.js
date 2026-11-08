// Service worker: keeps a copy of the game on the device so it works with no internet.
// Strategy: answer from the cache right away, and refresh the cache in the background
// when online, so the next launch gets the newest version.
// Bump CACHE when the file list changes.

const CACHE = 'ki-defenders-v12';

const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'lib/phaser.min.js',
  'fonts/bangers.woff2',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'src/main.js',
  'src/scenes/BootScene.js',
  'src/scenes/TitleScene.js',
  'src/scenes/LoginScene.js',
  'src/scenes/HubScene.js',
  'src/scenes/HeroScene.js',
  'src/scenes/LevelSelectScene.js',
  'src/scenes/GameScene.js',
  'src/scenes/ShopScene.js',
  'src/scenes/SettingsScene.js',
  'src/scenes/LeaderboardScene.js',
  'src/scenes/StoryScene.js',
  'src/systems/Audio.js',
  'src/systems/Settings.js',
  'src/data/shop.js',
  'src/data/google.js',
  'src/data/story.js',
  'src/data/art.js',
  'src/objects/Enemy.js',
  'src/objects/Fighter.js',
  'src/objects/Hero.js',
  'src/systems/Path.js',
  'src/systems/Grid.js',
  'src/systems/Save.js',
  'src/systems/Ads.js',
  'src/systems/Google.js',
  'src/systems/Online.js',
  'src/systems/Tutorial.js',
  'src/systems/Progress.js',
  'src/art/fighterArt.js',
  'src/art/mapArt.js',
  'src/art/enemyArt.js',
  'src/data/fighters.js',
  'src/data/enemies.js',
  'src/data/levels.js',
  'src/data/hero.js',
  'src/data/difficulty.js',
  'src/ui/Button.js',
  'src/ui/theme.js',
  'src/ui/menuBackground.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Never cache the online server's answers
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.includes('/api/')) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
