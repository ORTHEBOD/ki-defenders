import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import LoginScene from './scenes/LoginScene.js';
import HubScene from './scenes/HubScene.js';
import HeroScene from './scenes/HeroScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import GameScene from './scenes/GameScene.js';
import ShopScene from './scenes/ShopScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import LeaderboardScene from './scenes/LeaderboardScene.js';
import StoryScene from './scenes/StoryScene.js';
import { Audio } from './systems/Audio.js';
import { Sync } from './systems/Save.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#07090f',
  dom: { createContainer: true },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  scene: [
    BootScene, TitleScene, LoginScene, HubScene, HeroScene, LevelSelectScene, GameScene,
    ShopScene, SettingsScene, LeaderboardScene, StoryScene,
  ],
};

async function start() {
  // Wait for the anime font so the first texts don't render in a fallback font
  try {
    await document.fonts.load('32px Bangers');
  } catch (e) {
    // Font blocked: the fallback font is fine
  }
  window.game = new Phaser.Game(config);
}

start();

// Upload any progress that was saved while offline
Sync.now();

// Sound can only start after the player touches the screen
window.addEventListener('pointerdown', () => Audio.unlock());

// Save the game on the device so it can be played offline
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Offline mode not available:', e));
}
