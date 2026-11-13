import { FIGHTERS, FORMS } from '../data/fighters.js';
import { HEROES } from '../data/hero.js';
import { ART_FILES, artSize } from '../data/art.js';
import { drawFighterArt, formLook, pts } from '../art/fighterArt.js';
import {
  drawBrute, drawFlyer, drawSplitter, drawSplitling, drawMedic, drawOgre, drawKrag,
  drawScorpion, drawSandKing, drawMech, drawVorn, drawCoin,
} from '../art/enemyArt.js';

// Placeholder art drawn in code. When the AI art is ready, this scene will load PNG files instead,
// using the same texture keys, so nothing else in the game needs to change.

const O = 0x0d0d12;

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  // AI pictures from the art/ folder (see src/data/art.js). A missing file just keeps the drawn art.
  preload() {
    this.load.on('loaderror', (file) => console.warn('Art not found:', file.src));
    for (const key of ART_FILES) this.load.image(`art_${key}`, `art/${key}.png`);
    this.load.image('menu_bg', 'art/menu_bg.jpg');
  }

  create() {
    // One texture per form: kaito_0 (base), kaito_1 (gold hair) ... kaito_5 (blue hair).
    // Each form also has its 2nd and 3rd upgrade: kaito_1_2 (headband), kaito_1_3 (headband and cape).
    for (const def of Object.values(FIGHTERS)) {
      FORMS.forEach((form, i) => {
        const key = `${def.texture}_${i}`;
        const look = formLook(def.look, i);
        this.makeFighter(key, look);
        if (ART_FILES.includes(key)) return;
        const trim = i > 0 ? form.aura : def.color;
        for (const rank of [2, 3]) this.makeFighter(`${key}_${rank}`, { ...look, rank, trim });
      });
    }
    // Each hero in every form (hero_zenko_0 ... hero_zenko_5): learned in the Forms branch, and Power Up
    for (const [id, h] of Object.entries(HEROES)) {
      FORMS.forEach((form, i) => this.makeFighter(`hero_${id}_${i}`,
        { ...h.look, hair: form.hair ?? h.look.hair, longHair: form.longHair, sparks: form.sparks }));
    }
    this.makeGrunt();
    this.makeRunner();
    this.makeArt('brute', 56, drawBrute);
    this.makeArt('flyer', 48, drawFlyer);
    this.makeArt('splitter', 48, drawSplitter);
    this.makeArt('splitling', 32, drawSplitling);
    this.makeArt('medic', 48, drawMedic);
    this.makeArt('ogre', 80, drawOgre);
    this.makeArt('krag', 100, drawKrag);
    this.makeArt('scorpion', 80, drawScorpion);
    this.makeArt('sandKing', 100, drawSandKing);
    this.makeArt('mech', 80, drawMech);
    this.makeArt('vorn', 100, drawVorn);
    this.makeArt('coin', 28, drawCoin);
    this.makeSpot();
    this.makeWall();
    this.makeKi();
    this.makeLights();
    this.useArt();
    this.scene.start('Title');
  }

  // Swaps drawn textures for the AI pictures that loaded, shrunk to the size the game expects
  useArt() {
    for (const key of ART_FILES) {
      const raw = `art_${key}`;
      if (!this.textures.exists(raw)) continue;
      const img = this.textures.get(raw).getSourceImage();
      const size = artSize(key);
      let scale = Math.min(size / img.width, size / img.height);
      // A fighter's other pictures (kaito_2, kaito_0_attack) are shrunk like its base picture (kaito_0),
      // so the character keeps its size; a stretched-out arm or tall hair may stick out of the square
      const baseKey = `art_${key.replace(/_\d+(_attack)?$/, '_0')}`;
      if (baseKey !== raw && this.textures.exists(baseKey)) {
        const base = this.textures.get(baseKey).getSourceImage();
        scale = Math.min(size / base.width, size / base.height);
      }
      const w = img.width * scale;
      const h = img.height * scale;
      const cw = Math.max(size, Math.ceil(w));
      // Taller than the square: room is added above and below alike, so the feet stay where they were
      const over = Math.max(0, Math.ceil(h - size));
      const ch = size + over * 2;
      if (this.textures.exists(key)) this.textures.remove(key);
      const canvas = this.textures.createCanvas(key, cw, ch);
      const c = canvas.context;
      c.imageSmoothingQuality = 'high';
      const x = (cw - w) / 2;
      const y = over + size - h;
      // A dark outline around the picture, so it stands out on the map like the drawn art
      const shape = document.createElement('canvas');
      shape.width = cw;
      shape.height = ch;
      const sc = shape.getContext('2d');
      sc.imageSmoothingQuality = 'high';
      sc.drawImage(img, x, y, w, h);
      sc.globalCompositeOperation = 'source-in';
      sc.fillStyle = '#0d0d12';
      sc.fillRect(0, 0, cw, ch);
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) c.drawImage(shape, dx, dy);
      c.drawImage(img, x, y, w, h);
      canvas.refresh();
    }
  }

  makeFighter(key, look) {
    const g = this.make.graphics({ add: false });
    drawFighterArt(g, look);
    g.generateTexture(key, 64, 64);
    g.destroy();
  }

  makeArt(key, size, draw) {
    const g = this.make.graphics({ add: false });
    draw(g);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  makeGrunt() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x000000, 0.25).fillEllipse(24, 45, 30, 7);
    g.lineStyle(2.5, O);
    // Legs and feet
    g.fillStyle(0x5a2a78);
    g.fillRoundedRect(15, 33, 7, 10, 2).strokeRoundedRect(15, 33, 7, 10, 2);
    g.fillRoundedRect(26, 33, 7, 10, 2).strokeRoundedRect(26, 33, 7, 10, 2);
    g.fillStyle(0x3d1b54).fillRect(15, 40, 7, 3).fillRect(26, 40, 7, 3);
    // Arms
    g.fillStyle(0x9b59c6);
    g.fillCircle(9, 28, 4.5).strokeCircle(9, 28, 4.5);
    g.fillCircle(39, 28, 4.5).strokeCircle(39, 28, 4.5);
    // Body, with shade below and armor on the chest
    g.fillStyle(0x7b3fa0).fillRoundedRect(11, 19, 26, 17, 6).strokeRoundedRect(11, 19, 26, 17, 6);
    g.fillStyle(0x5a2a78).fillRoundedRect(13, 30, 22, 5, 3);
    g.fillStyle(0xd4d8e6).fillRoundedRect(14, 21, 20, 8, 2).strokeRoundedRect(14, 21, 20, 8, 2);
    g.fillStyle(0xffffff).fillRect(16, 22.5, 16, 2);
    g.fillStyle(0x9aa0b4).fillRect(16, 26, 16, 1.6);
    g.fillStyle(0xe02424).fillCircle(24, 25, 2.2);
    // Horns
    const hornL = pts([[14, 10], [9, 0], [19, 7]]);
    const hornR = pts([[34, 10], [39, 0], [29, 7]]);
    g.fillStyle(0xe9e2c8);
    g.fillPoints(hornL, true).strokePoints(hornL, true);
    g.fillPoints(hornR, true).strokePoints(hornR, true);
    // Head: shade under the chin, light on the forehead
    g.fillStyle(0x7b3fa0).fillEllipse(24, 13, 22, 16).strokeEllipse(24, 13, 22, 16);
    g.fillStyle(0x9b59c6).fillEllipse(24, 11.5, 19, 12);
    g.fillStyle(0xc38be0, 0.8).fillEllipse(21, 8, 9, 3.5);
    // Angry glowing eyes and a toothy mouth
    g.fillStyle(0xff5a4a, 0.35).fillCircle(19, 13, 4).fillCircle(29, 13, 4);
    g.fillStyle(0xffe14d).fillEllipse(19, 13.5, 5, 3.4).fillEllipse(29, 13.5, 5, 3.4);
    g.fillStyle(0xe02424).fillCircle(19.5, 13.5, 1.4).fillCircle(28.5, 13.5, 1.4);
    g.lineStyle(2.5, O);
    g.lineBetween(15.5, 9.5, 22, 12.5);
    g.lineBetween(32.5, 9.5, 26, 12.5);
    g.lineStyle(1.6, O).lineBetween(20, 18, 28, 18);
    g.fillStyle(0xffffff).fillTriangle(21, 18, 23, 18, 22, 20).fillTriangle(25, 18, 27, 18, 26, 20);
    g.generateTexture('grunt', 48, 48);
    g.destroy();
  }

  makeRunner() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x000000, 0.25).fillEllipse(24, 42, 28, 6);
    g.lineStyle(2.5, O);
    const tail = pts([[12, 26], [1, 20], [12, 31]]);
    g.fillStyle(0x2e8a45).fillPoints(tail, true).strokePoints(tail, true);
    g.fillRoundedRect(14, 30, 5, 10, 2).strokeRoundedRect(14, 30, 5, 10, 2);
    g.fillRoundedRect(26, 30, 5, 10, 2).strokeRoundedRect(26, 30, 5, 10, 2);
    // Spikes along the back
    g.fillStyle(0xffa53b);
    [[13, 21], [19, 19], [25, 19]].forEach(([x, y]) => {
      const spike = pts([[x - 3, y + 3], [x - 1, y - 4], [x + 3, y + 2]]);
      g.fillPoints(spike, true).strokePoints(spike, true);
    });
    // Body with a darker underside and a pale belly
    g.fillStyle(0x2e8a45).fillEllipse(22, 27, 24, 15).strokeEllipse(22, 27, 24, 15);
    g.fillStyle(0x3fae5a).fillEllipse(21.5, 25.5, 21, 11);
    g.fillStyle(0xbfe8a0).fillEllipse(23, 31, 13, 4.5);
    g.fillStyle(0x7ad98a, 0.9).fillEllipse(18, 22.5, 9, 3);
    // Head
    g.fillStyle(0x2e8a45).fillCircle(34, 17, 9).strokeCircle(34, 17, 9);
    g.fillStyle(0x3fae5a).fillCircle(33.4, 16, 7.4);
    g.fillStyle(0x7ad98a, 0.9).fillEllipse(31, 11.5, 6, 2.6);
    g.fillStyle(0xffe14d).fillCircle(37, 15, 3.2);
    g.lineStyle(1.5, O).strokeCircle(37, 15, 3.2);
    g.fillStyle(O).fillEllipse(38, 15, 1.8, 4);
    g.fillStyle(0xffffff).fillCircle(36.2, 13.8, 0.9);
    g.lineStyle(2, O).lineBetween(33.5, 10.8, 39.5, 12.2);
    g.lineStyle(1.6, O).lineBetween(36, 21.5, 41.5, 20);
    g.fillStyle(0xffffff).fillTriangle(38, 21, 40, 20.4, 39.2, 23);
    g.generateTexture('runner', 48, 48);
    g.destroy();
  }

  // Soft lights drawn on a canvas, where real gradients are possible: a round glow, the flame-shaped
  // power aura (both white, colored in the game with a tint) and the map's soft shadow
  makeLights() {
    const glow = this.textures.createCanvas('glow', 96, 96);
    let c = glow.context;
    let grad = c.createRadialGradient(48, 48, 0, 48, 48, 48);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.6)');
    grad.addColorStop(0.65, 'rgba(255,255,255,0.18)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = grad;
    c.fillRect(0, 0, 96, 96);
    glow.refresh();

    const aura = this.textures.createCanvas('aura', 80, 108);
    c = aura.context;
    const flame = [[14, 96], [3, 70], [12, 46], [7, 26], [21, 38], [25, 12], [33, 30], [40, 2], [47, 30], [55, 12], [59, 38],
      [73, 26], [68, 46], [77, 70], [66, 96]];
    const drawFlame = (scale, alpha) => {
      c.save();
      c.translate(40, 100);
      c.scale(scale, scale);
      c.translate(-40, -100);
      c.beginPath();
      flame.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.quadraticCurveTo(40, 110, 14, 96);
      c.closePath();
      c.fillStyle = `rgba(255,255,255,${alpha})`;
      c.fill();
      c.restore();
    };
    c.shadowColor = 'rgba(255,255,255,0.9)';
    c.shadowBlur = 8;
    c.lineJoin = 'round';
    drawFlame(0.94, 0.4);
    c.shadowBlur = 4;
    drawFlame(0.7, 0.45);
    aura.refresh();

    // Darker corners and a slightly darker bottom, stretched over the whole map
    const vig = this.textures.createCanvas('vignette', 320, 180);
    c = vig.context;
    grad = c.createRadialGradient(160, 84, 70, 160, 90, 196);
    grad.addColorStop(0, 'rgba(0,0,10,0)');
    grad.addColorStop(1, 'rgba(0,0,10,0.36)');
    c.fillStyle = grad;
    c.fillRect(0, 0, 320, 180);
    grad = c.createLinearGradient(0, 0, 0, 180);
    grad.addColorStop(0, 'rgba(255,255,255,0.05)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.14)');
    c.fillStyle = grad;
    c.fillRect(0, 0, 320, 180);
    vig.refresh();
  }

  makeSpot() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x000000, 0.18).fillCircle(32, 32, 28);
    g.lineStyle(3, 0xffffff, 0.55).strokeCircle(32, 32, 26);
    g.lineStyle(3, 0xffffff, 0.35);
    g.lineBetween(32, 24, 32, 40);
    g.lineBetween(24, 32, 40, 32);
    g.generateTexture('spot', 64, 64);
    g.destroy();
  }

  makeWall() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x000000, 0.2).fillRoundedRect(4, 10, 56, 50, 8);
    g.lineStyle(3, O);
    g.fillStyle(0x7d8496).fillRoundedRect(4, 4, 56, 50, 8).strokeRoundedRect(4, 4, 56, 50, 8);
    g.fillStyle(0x9aa3b8).fillRoundedRect(10, 8, 44, 18, 6);
    g.lineStyle(2, 0x555b6b);
    g.lineBetween(32, 26, 32, 52);
    g.lineBetween(8, 30, 56, 30);
    g.fillStyle(0x7fd8ff, 0.9).fillCircle(32, 17, 5);
    g.generateTexture('wall', 64, 64);
    g.destroy();
  }

  makeKi() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xffa31a).fillCircle(14, 14, 12);
    g.lineStyle(2, O).strokeCircle(14, 14, 12);
    g.fillStyle(0xffe14d).fillCircle(14, 14, 7);
    g.fillStyle(0xffffff).fillCircle(12, 12, 3);
    g.generateTexture('ki', 28, 28);
    g.destroy();
  }
}
