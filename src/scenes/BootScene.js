import { FIGHTERS, FORMS } from '../data/fighters.js';
import { HEROES } from '../data/hero.js';
import { ART_FILES, artSize } from '../data/art.js';
import { drawFighterArt, pts } from '../art/fighterArt.js';
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
  }

  create() {
    // One texture per form: kaito_0 (base), kaito_1 (gold hair) ... kaito_5 (blue hair)
    for (const def of Object.values(FIGHTERS)) {
      FORMS.forEach((form, i) => this.makeFighter(`${def.texture}_${i}`,
        { ...def.look, hair: form.hair ?? def.look.hair, longHair: form.longHair, sparks: form.sparks }));
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
      const scale = Math.min(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      if (this.textures.exists(key)) this.textures.remove(key);
      const canvas = this.textures.createCanvas(key, size, size);
      canvas.context.imageSmoothingQuality = 'high';
      canvas.context.drawImage(img, (size - w) / 2, size - h, w, h);
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
    g.fillStyle(0x5a2a78);
    g.fillRect(15, 33, 7, 10).strokeRect(15, 33, 7, 10);
    g.fillRect(26, 33, 7, 10).strokeRect(26, 33, 7, 10);
    g.fillStyle(0x7b3fa0).fillRoundedRect(11, 19, 26, 17, 6).strokeRoundedRect(11, 19, 26, 17, 6);
    g.fillStyle(0xd4d8e6).fillRect(14, 21, 20, 7).strokeRect(14, 21, 20, 7);
    const hornL = pts([[14, 10], [9, 0], [19, 7]]);
    const hornR = pts([[34, 10], [39, 0], [29, 7]]);
    g.fillStyle(0x9b59c6);
    g.fillPoints(hornL, true).strokePoints(hornL, true);
    g.fillPoints(hornR, true).strokePoints(hornR, true);
    g.fillEllipse(24, 13, 22, 16).strokeEllipse(24, 13, 22, 16);
    g.lineStyle(3, 0xe02424);
    g.lineBetween(17, 11, 22, 14);
    g.lineBetween(31, 11, 26, 14);
    g.generateTexture('grunt', 48, 48);
    g.destroy();
  }

  makeRunner() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x000000, 0.25).fillEllipse(24, 42, 28, 6);
    g.lineStyle(2.5, O);
    const tail = pts([[12, 26], [1, 20], [12, 31]]);
    g.fillStyle(0x2e8a45).fillPoints(tail, true).strokePoints(tail, true);
    g.fillRect(14, 30, 5, 10).strokeRect(14, 30, 5, 10);
    g.fillRect(26, 30, 5, 10).strokeRect(26, 30, 5, 10);
    g.fillStyle(0x3fae5a).fillEllipse(22, 27, 24, 15).strokeEllipse(22, 27, 24, 15);
    g.fillCircle(34, 17, 9).strokeCircle(34, 17, 9);
    g.fillStyle(0xffe14d).fillCircle(37, 15, 3);
    g.fillStyle(O).fillCircle(38, 15, 1.4);
    g.generateTexture('runner', 48, 48);
    g.destroy();
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
