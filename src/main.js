import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#07090f',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  scene: [BootScene, GameScene],
};

async function start() {
  // Wait for the anime font so the first texts don't render in a fallback font
  try {
    await document.fonts.load('32px Bangers');
  } catch (e) {
    // Offline or font blocked: the fallback font is fine
  }
  window.game = new Phaser.Game(config);
}

start();

// Save the game on the device so it can be played offline
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Offline mode not available:', e));
}
