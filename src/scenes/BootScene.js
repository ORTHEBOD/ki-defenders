import { FIGHTERS } from '../data/fighters.js';

// Placeholder art drawn in code. When the AI art is ready, this scene will load PNG files instead,
// using the same texture keys, so nothing else in the game needs to change.

const O = 0x0d0d12;
const pts = (arr) => arr.map(([x, y]) => ({ x, y }));

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    for (const def of Object.values(FIGHTERS)) this.makeFighter(def.texture, def.look);
    this.makeGrunt();
    this.makeRunner();
    this.makeSpot();
    this.makeKi();
    this.scene.start('Game');
  }

  makeFighter(key, look) {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x000000, 0.25).fillEllipse(32, 61, 34, 8);
    g.lineStyle(2.5, O);
    // Legs and boots
    g.fillStyle(look.belt);
    g.fillRect(24, 48, 7, 10).strokeRect(24, 48, 7, 10);
    g.fillRect(33, 48, 7, 10).strokeRect(33, 48, 7, 10);
    g.fillStyle(look.boots);
    g.fillRect(23, 55, 9, 5).strokeRect(23, 55, 9, 5);
    g.fillRect(32, 55, 9, 5).strokeRect(32, 55, 9, 5);
    // Body (gi), belt and fists
    g.fillStyle(look.gi).fillRoundedRect(20, 32, 24, 18, 5).strokeRoundedRect(20, 32, 24, 18, 5);
    g.fillStyle(look.belt).fillRect(20, 45, 24, 4).strokeRect(20, 45, 24, 4);
    g.fillStyle(look.skin);
    g.fillCircle(17, 41, 4.5).strokeCircle(17, 41, 4.5);
    g.fillCircle(47, 41, 4.5).strokeCircle(47, 41, 4.5);
    // Head and eyes
    g.fillCircle(32, 24, 10).strokeCircle(32, 24, 10);
    g.lineStyle(2.5, O);
    g.lineBetween(27, 23, 30, 25);
    g.lineBetween(34, 25, 37, 23);
    // Spiky hair
    const hair = pts([[21, 26], [13, 17], [21, 17], [17, 6], [27, 13], [32, 0], [37, 12], [47, 6], [43, 17], [51, 17], [43, 26], [39, 18], [32, 15], [25, 18]]);
    g.fillStyle(look.hair).fillPoints(hair, true);
    g.strokePoints(hair, true);
    g.generateTexture(key, 64, 64);
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
