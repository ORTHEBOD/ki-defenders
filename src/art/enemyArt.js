import { pts } from './fighterArt.js';

// Placeholder art for the Phase 5 enemies and bosses, drawn in code.
// Each function draws into a Graphics object; BootScene turns it into a texture.

const O = 0x0d0d12;

function eyes(g, x1, x2, y, color = 0xe02424) {
  g.lineStyle(3, color);
  g.lineBetween(x1 - 4, y - 2, x1 + 2, y + 1);
  g.lineBetween(x2 + 4, y - 2, x2 - 2, y + 1);
}

// Slow armored brute (56x56)
export function drawBrute(g) {
  g.fillStyle(0x000000, 0.25).fillEllipse(28, 52, 44, 8);
  g.lineStyle(2.5, O);
  g.fillStyle(0x6b3a2a);
  g.fillRect(14, 38, 10, 12).strokeRect(14, 38, 10, 12);
  g.fillRect(32, 38, 10, 12).strokeRect(32, 38, 10, 12);
  g.fillStyle(0xa04a3a).fillEllipse(8, 30, 14, 18).strokeEllipse(8, 30, 14, 18);
  g.fillEllipse(48, 30, 14, 18).strokeEllipse(48, 30, 14, 18);
  g.fillStyle(0xb85a44).fillRoundedRect(9, 18, 38, 24, 9).strokeRoundedRect(9, 18, 38, 24, 9);
  // Armor plates
  g.fillStyle(0x8c8f99).fillRoundedRect(13, 22, 30, 12, 4).strokeRoundedRect(13, 22, 30, 12, 4);
  g.fillStyle(0xb3b6c0).fillRect(17, 25, 22, 3);
  g.fillStyle(0xb85a44).fillEllipse(28, 13, 24, 18).strokeEllipse(28, 13, 24, 18);
  g.fillStyle(0xf2f4f8);
  g.fillPoints(pts([[20, 17], [18, 10], [23, 16]]), true);
  g.fillPoints(pts([[36, 17], [38, 10], [33, 16]]), true);
  eyes(g, 23, 33, 11);
}

// Small flying imp with bat wings (48x48)
export function drawFlyer(g) {
  g.lineStyle(2.5, O);
  const wingL = pts([[18, 20], [2, 8], [6, 20], [1, 28], [16, 27]]);
  const wingR = pts([[30, 20], [46, 8], [42, 20], [47, 28], [32, 27]]);
  g.fillStyle(0x4a2a6a).fillPoints(wingL, true).strokePoints(wingL, true);
  g.fillPoints(wingR, true).strokePoints(wingR, true);
  g.fillStyle(0x8a4cc0).fillEllipse(24, 27, 18, 20).strokeEllipse(24, 27, 18, 20);
  const tail = pts([[24, 36], [22, 45], [27, 41]]);
  g.fillPoints(tail, true).strokePoints(tail, true);
  g.fillStyle(0xa86ad8).fillCircle(24, 15, 9).strokeCircle(24, 15, 9);
  g.fillStyle(0xffe14d).fillCircle(20, 14, 2.5).fillCircle(28, 14, 2.5);
}

function blob(g, cx, cy, w, h, body, shine) {
  g.lineStyle(2.5, O);
  g.fillStyle(body);
  g.beginPath();
  g.moveTo(cx - w / 2, cy + h / 2);
  g.lineTo(cx - w / 2, cy);
  g.arc(cx, cy, w / 2, Math.PI, 0, false);
  g.lineTo(cx + w / 2, cy + h / 2);
  g.closePath();
  g.fillPath();
  g.strokePath();
  g.fillStyle(shine, 0.8).fillEllipse(cx - w * 0.2, cy - w * 0.22, w * 0.25, w * 0.15);
}

// Slime that splits in two (48x48)
export function drawSplitter(g) {
  g.fillStyle(0x000000, 0.25).fillEllipse(24, 44, 36, 7);
  blob(g, 24, 26, 34, 34, 0xe0609a, 0xffc4dd);
  // The crack down the middle shows it will split
  g.lineStyle(2, 0x7a1a4a);
  g.strokePoints(pts([[24, 12], [21, 20], [26, 27], [22, 35], [25, 42]]));
  g.fillStyle(0xffffff).fillCircle(16, 26, 5).fillCircle(32, 26, 5);
  g.fillStyle(O).fillCircle(17, 27, 2.5).fillCircle(31, 27, 2.5);
}

// Small half of a splitter (32x32)
export function drawSplitling(g) {
  g.fillStyle(0x000000, 0.25).fillEllipse(16, 29, 22, 5);
  blob(g, 16, 18, 20, 20, 0xf07ab0, 0xffd4e6);
  g.fillStyle(0xffffff).fillCircle(12, 18, 3).fillCircle(20, 18, 3);
  g.fillStyle(O).fillCircle(12.5, 18.5, 1.5).fillCircle(19.5, 18.5, 1.5);
}

// Medic in a white robe with a green cross (48x48)
export function drawMedic(g) {
  g.fillStyle(0x000000, 0.25).fillEllipse(24, 45, 30, 7);
  g.lineStyle(2.5, O);
  const robe = pts([[14, 20], [34, 20], [38, 43], [10, 43]]);
  g.fillStyle(0xeef2f8).fillPoints(robe, true).strokePoints(robe, true);
  g.fillStyle(0x2fbf5a).fillRect(21, 26, 6, 14).fillRect(17, 30, 14, 6);
  // Staff with a glowing orb
  g.lineStyle(3, 0x7a4e2d).lineBetween(40, 14, 40, 44);
  g.fillStyle(0x9bff7a).fillCircle(40, 11, 5);
  g.lineStyle(2, O).strokeCircle(40, 11, 5);
  g.fillStyle(0x2f9a4a).fillCircle(24, 13, 10).strokeCircle(24, 13, 10);
  g.fillStyle(0x7b3fa0).fillEllipse(24, 15, 13, 10);
  g.fillStyle(0xffe14d).fillCircle(21, 15, 1.8).fillCircle(27, 15, 1.8);
}

// Mini boss: Ogre Captain with a club (80x80)
export function drawOgre(g) {
  g.fillStyle(0x000000, 0.28).fillEllipse(40, 75, 60, 10);
  g.lineStyle(3, O);
  // Club
  g.fillStyle(0x7a4e2d).fillRoundedRect(60, 18, 12, 40, 5).strokeRoundedRect(60, 18, 12, 40, 5);
  g.fillStyle(0x5a3a1d).fillCircle(66, 18, 10).strokeCircle(66, 18, 10);
  g.fillStyle(0x3f6a2a);
  g.fillRect(22, 56, 13, 16).strokeRect(22, 56, 13, 16);
  g.fillRect(45, 56, 13, 16).strokeRect(45, 56, 13, 16);
  g.fillStyle(0x5f9a3a).fillRoundedRect(14, 28, 52, 34, 14).strokeRoundedRect(14, 28, 52, 34, 14);
  g.fillStyle(0x7a4e2d).fillRect(14, 48, 52, 8).strokeRect(14, 48, 52, 8);
  g.fillStyle(0xffd93b).fillRect(36, 48, 8, 8);
  g.fillStyle(0x6fb04a).fillEllipse(40, 22, 34, 26).strokeEllipse(40, 22, 34, 26);
  // Captain helmet
  g.fillStyle(0x8c8f99).fillRoundedRect(24, 6, 32, 12, 5).strokeRoundedRect(24, 6, 32, 12, 5);
  g.fillStyle(0xe02424).fillPoints(pts([[40, 7], [36, 1], [44, 1]]), true);
  g.fillStyle(0xf2f4f8);
  g.fillPoints(pts([[31, 28], [29, 20], [34, 27]]), true);
  g.fillPoints(pts([[49, 28], [51, 20], [46, 27]]), true);
  eyes(g, 33, 47, 21);
}

// Big boss: General Krag, armored commander with a cape (100x100)
export function drawKrag(g) {
  g.fillStyle(0x000000, 0.3).fillEllipse(50, 95, 74, 12);
  g.lineStyle(3, O);
  const cape = pts([[24, 34], [76, 34], [88, 90], [12, 90]]);
  g.fillStyle(0x8a1a2a).fillPoints(cape, true).strokePoints(cape, true);
  g.fillStyle(0x2a1a3a);
  g.fillRect(34, 70, 13, 20).strokeRect(34, 70, 13, 20);
  g.fillRect(53, 70, 13, 20).strokeRect(53, 70, 13, 20);
  g.fillStyle(0x4a2a6a).fillRoundedRect(26, 34, 48, 40, 10).strokeRoundedRect(26, 34, 48, 40, 10);
  // Chest armor with a glowing gem
  g.fillStyle(0xd4d8e6).fillRoundedRect(31, 38, 38, 22, 6).strokeRoundedRect(31, 38, 38, 22, 6);
  g.fillStyle(0xe02424).fillCircle(50, 49, 5);
  // Shoulder pads
  g.fillStyle(0xd4d8e6);
  g.fillEllipse(24, 38, 22, 16).strokeEllipse(24, 38, 22, 16);
  g.fillEllipse(76, 38, 22, 16).strokeEllipse(76, 38, 22, 16);
  // Head and horned helmet
  g.fillStyle(0x9b59c6).fillEllipse(50, 24, 30, 26).strokeEllipse(50, 24, 30, 26);
  const hornL = pts([[38, 16], [22, 2], [40, 10]]);
  const hornR = pts([[62, 16], [78, 2], [60, 10]]);
  g.fillStyle(0xf2e6c4).fillPoints(hornL, true).strokePoints(hornL, true);
  g.fillPoints(hornR, true).strokePoints(hornR, true);
  g.fillStyle(0x2a1a3a).fillRoundedRect(36, 9, 28, 10, 4).strokeRoundedRect(36, 9, 28, 10, 4);
  eyes(g, 44, 56, 25, 0xff3b3b);
  g.lineStyle(2, O).lineBetween(45, 32, 55, 32);
}

// Mini boss of the desert: a giant scorpion (80x80)
export function drawScorpion(g) {
  g.fillStyle(0x000000, 0.28).fillEllipse(40, 72, 66, 10);
  g.lineStyle(3, O);
  g.lineStyle(4, O);
  for (const [x, y] of [[18, 52], [26, 58], [54, 58], [62, 52]]) g.lineBetween(40, 54, x, y + 10);
  g.lineStyle(3, O);
  // Tail curling over the back with a stinger
  g.fillStyle(0xb8601a);
  [[58, 44, 9], [64, 34, 8], [64, 23, 7], [57, 15, 6]].forEach(([x, y, r]) => g.fillCircle(x, y, r).strokeCircle(x, y, r));
  g.fillStyle(0xffe14d).fillPoints(pts([[52, 13], [44, 18], [50, 8]]), true);
  // Body and claws
  g.fillStyle(0xd0782a).fillEllipse(38, 52, 40, 24).strokeEllipse(38, 52, 40, 24);
  g.fillStyle(0xe8944a).fillEllipse(34, 48, 18, 8);
  g.fillStyle(0xd0782a);
  g.fillCircle(12, 40, 9).strokeCircle(12, 40, 9);
  g.fillPoints(pts([[6, 32], [12, 26], [18, 34]]), true);
  g.fillCircle(22, 34, 6).strokeCircle(22, 34, 6);
  // Crown
  g.fillStyle(0xffd93b).fillPoints(pts([[26, 40], [28, 32], [32, 38], [36, 30], [40, 38], [44, 32], [46, 40]]), true);
  g.lineStyle(2, O).strokePoints(pts([[26, 40], [28, 32], [32, 38], [36, 30], [40, 38], [44, 32], [46, 40]]), true);
  eyes(g, 31, 41, 47, 0xff3b3b);
}

// Big boss of the desert: Sand King Ozul (100x100)
export function drawSandKing(g) {
  g.fillStyle(0x000000, 0.3).fillEllipse(50, 95, 76, 12);
  g.lineStyle(3, O);
  const robe = pts([[30, 36], [70, 36], [84, 90], [16, 90]]);
  g.fillStyle(0xc9a23a).fillPoints(robe, true).strokePoints(robe, true);
  g.fillStyle(0x8a5a1a).fillPoints(pts([[44, 36], [56, 36], [60, 90], [40, 90]]), true);
  g.fillStyle(0xe8c86a).fillEllipse(24, 42, 22, 16).strokeEllipse(24, 42, 22, 16);
  g.fillEllipse(76, 42, 22, 16).strokeEllipse(76, 42, 22, 16);
  // Staff with a sun gem
  g.lineStyle(4, 0x5a3a1a).lineBetween(88, 20, 88, 92);
  g.fillStyle(0xff8a3d).fillCircle(88, 16, 8);
  g.lineStyle(3, O).strokeCircle(88, 16, 8);
  // Head with a tall sand-crown
  g.fillStyle(0x7a5a3a).fillEllipse(50, 26, 28, 26).strokeEllipse(50, 26, 28, 26);
  const crown = pts([[34, 18], [36, 0], [44, 10], [50, -2], [56, 10], [64, 0], [66, 18]]);
  g.fillStyle(0xffd93b).fillPoints(crown, true).strokePoints(crown, true);
  g.fillStyle(0x3fd0f5).fillCircle(50, 12, 3);
  eyes(g, 44, 56, 27, 0xffe14d);
  g.fillStyle(0xe8d8b0).fillPoints(pts([[42, 33], [58, 33], [50, 46]]), true);
}

// Mini boss of the mothership: War Mech (80x80)
export function drawMech(g) {
  g.fillStyle(0x000000, 0.28).fillEllipse(40, 75, 60, 10);
  g.lineStyle(3, O);
  g.fillStyle(0x4a5266);
  g.fillRect(20, 54, 14, 18).strokeRect(20, 54, 14, 18);
  g.fillRect(46, 54, 14, 18).strokeRect(46, 54, 14, 18);
  g.fillStyle(0x6a7488).fillRoundedRect(14, 24, 52, 34, 6).strokeRoundedRect(14, 24, 52, 34, 6);
  g.fillStyle(0x8a94a8).fillRect(18, 28, 20, 8);
  // Arm cannons
  g.fillStyle(0x4a5266);
  g.fillRect(2, 30, 14, 22).strokeRect(2, 30, 14, 22);
  g.fillRect(64, 30, 14, 22).strokeRect(64, 30, 14, 22);
  g.fillStyle(0xff3b3b).fillCircle(9, 52, 3).fillCircle(71, 52, 3);
  // Glowing core and cockpit
  g.fillStyle(0x3fd0f5).fillCircle(40, 44, 6);
  g.lineStyle(2, O).strokeCircle(40, 44, 6);
  g.lineStyle(3, O);
  g.fillStyle(0x6a7488).fillRoundedRect(26, 6, 28, 20, 6).strokeRoundedRect(26, 6, 28, 20, 6);
  g.fillStyle(0xff3b3b).fillRect(30, 13, 20, 5);
}

// Final boss: Emperor Vorn (100x100)
export function drawVorn(g) {
  g.fillStyle(0x000000, 0.3).fillEllipse(50, 95, 76, 12);
  g.lineStyle(3, O);
  const cape = pts([[22, 32], [78, 32], [94, 92], [6, 92]]);
  g.fillStyle(0x1a1030).fillPoints(cape, true).strokePoints(cape, true);
  g.fillStyle(0x3a1a5a).fillPoints(pts([[26, 36], [74, 36], [84, 88], [16, 88]]), true);
  g.fillStyle(0xeef2f8).fillRoundedRect(32, 36, 36, 44, 10).strokeRoundedRect(32, 36, 36, 44, 10);
  g.fillStyle(0x9b59c6).fillRoundedRect(36, 40, 28, 18, 6);
  g.fillStyle(0xffd93b).fillCircle(50, 49, 5);
  g.fillStyle(0xeef2f8);
  g.fillEllipse(26, 38, 20, 14).strokeEllipse(26, 38, 20, 14);
  g.fillEllipse(74, 38, 20, 14).strokeEllipse(74, 38, 20, 14);
  // Pale head, dark horns and a glowing gem
  g.fillStyle(0xd8d0f0).fillEllipse(50, 22, 26, 26).strokeEllipse(50, 22, 26, 26);
  const hornL = pts([[40, 14], [28, -2], [44, 8]]);
  const hornR = pts([[60, 14], [72, -2], [56, 8]]);
  g.fillStyle(0x2a1a3a).fillPoints(hornL, true).strokePoints(hornL, true);
  g.fillPoints(hornR, true).strokePoints(hornR, true);
  g.fillStyle(0xff3bb0).fillCircle(50, 12, 3.5);
  eyes(g, 44, 56, 23, 0xff3bb0);
  g.lineStyle(2, O).lineBetween(46, 30, 54, 30);
}

// A gold coin (28x28)
export function drawCoin(g) {
  g.fillStyle(0xc98a1a).fillCircle(14, 14, 12);
  g.lineStyle(2, O).strokeCircle(14, 14, 12);
  g.fillStyle(0xffd93b).fillCircle(13, 13, 9);
  g.lineStyle(2, 0xc98a1a).strokeCircle(13, 13, 6);
  g.fillStyle(0xffffff, 0.7).fillEllipse(10, 9, 5, 3);
}

// ---------- Frozen Peaks ----------

// Snow Imp: a small, quick ice gremlin (48x48)
export function drawSnowImp(g) {
  g.fillStyle(0x000000, 0.25).fillEllipse(24, 44, 28, 6);
  g.lineStyle(2.5, O);
  g.fillStyle(0x7fb8e0);
  g.fillRoundedRect(15, 33, 6, 9, 2).strokeRoundedRect(15, 33, 6, 9, 2);
  g.fillRoundedRect(27, 33, 6, 9, 2).strokeRoundedRect(27, 33, 6, 9, 2);
  g.fillStyle(0xbfe6ff).fillEllipse(24, 28, 22, 16).strokeEllipse(24, 28, 22, 16);
  g.fillStyle(0xffffff, 0.8).fillEllipse(20, 25, 8, 4);
  // Ice spikes on the head
  g.fillStyle(0xe8f8ff);
  for (const x of [16, 24, 32]) {
    const spike = pts([[x - 4, 14], [x, 2], [x + 4, 14]]);
    g.fillPoints(spike, true).strokePoints(spike, true);
  }
  g.fillStyle(0x9fd4f5).fillCircle(24, 16, 10).strokeCircle(24, 16, 10);
  g.fillStyle(0x1a4a8a).fillCircle(20, 16, 2.5).fillCircle(28, 16, 2.5);
  g.lineStyle(2, O).lineBetween(20, 21, 28, 21);
}

// Ice Golem: slow and armored, made of ice blocks (56x56)
export function drawIceGolem(g) {
  g.fillStyle(0x000000, 0.25).fillEllipse(28, 52, 44, 8);
  g.lineStyle(2.5, O);
  g.fillStyle(0x6aa8d8);
  g.fillRect(13, 38, 11, 12).strokeRect(13, 38, 11, 12);
  g.fillRect(32, 38, 11, 12).strokeRect(32, 38, 11, 12);
  g.fillStyle(0x8cc8f0);
  g.fillRoundedRect(1, 20, 12, 20, 4).strokeRoundedRect(1, 20, 12, 20, 4);
  g.fillRoundedRect(43, 20, 12, 20, 4).strokeRoundedRect(43, 20, 12, 20, 4);
  g.fillStyle(0xaee0ff).fillRoundedRect(10, 16, 36, 26, 5).strokeRoundedRect(10, 16, 36, 26, 5);
  g.lineStyle(1.5, 0x5a8ab8).lineBetween(18, 18, 22, 40).lineBetween(34, 20, 30, 38);
  g.fillStyle(0xffffff, 0.6).fillRect(14, 20, 8, 4);
  g.lineStyle(2.5, O);
  g.fillStyle(0xcdeeff).fillRoundedRect(17, 2, 22, 16, 4).strokeRoundedRect(17, 2, 22, 16, 4);
  g.fillStyle(0x3fd0f5).fillRect(21, 8, 5, 3).fillRect(30, 8, 5, 3);
}

// Frost Bat: flying (48x48)
export function drawFrostBat(g) {
  g.lineStyle(2.5, O);
  const wingL = pts([[19, 22], [1, 10], [5, 18], [0, 28], [8, 25], [17, 30]]);
  const wingR = pts([[29, 22], [47, 10], [43, 18], [48, 28], [40, 25], [31, 30]]);
  g.fillStyle(0x5a8ad8).fillPoints(wingL, true).strokePoints(wingL, true);
  g.fillPoints(wingR, true).strokePoints(wingR, true);
  g.fillStyle(0x9fd4f5).fillEllipse(24, 26, 16, 20).strokeEllipse(24, 26, 16, 20);
  g.fillStyle(0xbfe6ff).fillCircle(24, 15, 8).strokeCircle(24, 15, 8);
  g.fillStyle(0xbfe6ff).fillPoints(pts([[18, 10], [17, 3], [22, 8]]), true).fillPoints(pts([[30, 10], [31, 3], [26, 8]]), true);
  g.fillStyle(0x1a4a8a).fillCircle(21, 15, 2).fillCircle(27, 15, 2);
  g.fillStyle(0xffffff).fillTriangle(22, 19, 24, 19, 23, 22).fillTriangle(25, 19, 27, 19, 26, 22);
}

// Yeti Cub: a furry ball that breaks into 2 snowballs (48x48)
export function drawYetiCub(g) {
  g.fillStyle(0x000000, 0.25).fillEllipse(24, 45, 34, 7);
  g.lineStyle(2.5, O);
  g.fillStyle(0xe8eef8).fillCircle(9, 30, 6).strokeCircle(9, 30, 6).fillCircle(39, 30, 6).strokeCircle(39, 30, 6);
  g.fillStyle(0xf4f8ff).fillCircle(24, 27, 16).strokeCircle(24, 27, 16);
  // Fur tufts
  g.fillStyle(0xf4f8ff);
  for (const [x, y] of [[14, 13], [24, 10], [34, 13]]) g.fillPoints(pts([[x - 5, y + 4], [x, y - 4], [x + 5, y + 4]]), true);
  g.fillStyle(0x8ab0d8).fillEllipse(24, 27, 18, 14);
  g.fillStyle(0xffffff).fillCircle(19, 25, 3.5).fillCircle(29, 25, 3.5);
  g.fillStyle(O).fillCircle(19.5, 25.5, 1.8).fillCircle(28.5, 25.5, 1.8);
  g.lineStyle(2, O).lineBetween(21, 31, 27, 31);
}

// Snowball: what a Yeti Cub breaks into (32x32)
export function drawSnowball(g) {
  g.fillStyle(0x000000, 0.25).fillEllipse(16, 29, 22, 5);
  g.lineStyle(2, O);
  g.fillStyle(0xf4f8ff).fillCircle(16, 18, 10).strokeCircle(16, 18, 10);
  g.fillStyle(0xbfd8f0).fillEllipse(18, 22, 12, 6);
  g.fillStyle(O).fillCircle(13, 17, 1.6).fillCircle(19, 17, 1.6);
}

// Mini boss: Frost Giant with an ice club (80x80)
export function drawFrostGiant(g) {
  g.fillStyle(0x000000, 0.28).fillEllipse(40, 75, 62, 10);
  g.lineStyle(3, O);
  g.fillStyle(0xbfe6ff).fillRoundedRect(62, 12, 12, 46, 5).strokeRoundedRect(62, 12, 12, 46, 5);
  g.fillStyle(0xe8f8ff).fillPoints(pts([[60, 16], [68, 2], [76, 16]]), true).strokePoints(pts([[60, 16], [68, 2], [76, 16]]), true);
  g.fillStyle(0x3a5a8a);
  g.fillRect(22, 56, 13, 16).strokeRect(22, 56, 13, 16);
  g.fillRect(45, 56, 13, 16).strokeRect(45, 56, 13, 16);
  g.fillStyle(0x6a9ad0).fillRoundedRect(14, 28, 52, 32, 14).strokeRoundedRect(14, 28, 52, 32, 14);
  // Fur cloak over the shoulders
  g.fillStyle(0xf4f8ff).fillRoundedRect(12, 26, 56, 12, 6).strokeRoundedRect(12, 26, 56, 12, 6);
  g.fillStyle(0x8cbce8).fillEllipse(40, 20, 32, 24).strokeEllipse(40, 20, 32, 24);
  // White beard
  g.fillStyle(0xf4f8ff).fillPoints(pts([[28, 24], [52, 24], [46, 38], [40, 42], [34, 38]]), true);
  g.lineStyle(2, O).strokePoints(pts([[28, 24], [52, 24], [46, 38], [40, 42], [34, 38]]), true);
  eyes(g, 34, 46, 18, 0x3fd0f5);
}

// Big boss: Ice Queen Seraka, with a crown of ice and a long gown (100x100)
export function drawIceQueen(g) {
  g.fillStyle(0x000000, 0.3).fillEllipse(50, 95, 70, 12);
  g.lineStyle(3, O);
  const gown = pts([[36, 40], [64, 40], [84, 92], [16, 92]]);
  g.fillStyle(0x4a7ad8).fillPoints(gown, true).strokePoints(gown, true);
  g.fillStyle(0x8cc8f0).fillPoints(pts([[44, 40], [56, 40], [64, 92], [36, 92]]), true);
  // Staff with a snowflake
  g.lineStyle(4, 0xbfe6ff).lineBetween(82, 20, 82, 90);
  g.lineStyle(3, 0xe8f8ff);
  for (let a = 0; a < 3; a++) {
    const ang = (a * Math.PI) / 3;
    g.lineBetween(82 - Math.cos(ang) * 10, 16 - Math.sin(ang) * 10, 82 + Math.cos(ang) * 10, 16 + Math.sin(ang) * 10);
  }
  g.lineStyle(3, O);
  g.fillStyle(0xdceeff).fillEllipse(50, 44, 34, 16).strokeEllipse(50, 44, 34, 16);
  // Long white hair and face
  g.fillStyle(0xf4f8ff).fillRoundedRect(34, 18, 32, 34, 12).strokeRoundedRect(34, 18, 32, 34, 12);
  g.fillStyle(0xd8e8f8).fillEllipse(50, 28, 22, 22).strokeEllipse(50, 28, 22, 22);
  // Ice crown
  const crown = pts([[36, 18], [40, 4], [45, 14], [50, 0], [55, 14], [60, 4], [64, 18]]);
  g.fillStyle(0x9fe8ff).fillPoints(crown, true).strokePoints(crown, true);
  g.fillStyle(0x1a4a8a).fillCircle(45, 28, 2.5).fillCircle(55, 28, 2.5);
  g.lineStyle(2, 0x5a2a6a).lineBetween(46, 35, 54, 35);
}

// ---------- Volcano ----------

// Lava Slime: bursts into fire when it falls (48x48)
export function drawLavaSlime(g) {
  g.fillStyle(0x000000, 0.25).fillEllipse(24, 44, 36, 7);
  blob(g, 24, 26, 34, 34, 0xd8401a, 0xffb347);
  g.fillStyle(0xffd93b).fillCircle(15, 34, 3).fillCircle(31, 36, 2.5).fillCircle(26, 18, 2);
  g.fillStyle(0xffe14d).fillCircle(17, 25, 4.5).fillCircle(31, 25, 4.5);
  g.fillStyle(O).fillCircle(18, 26, 2).fillCircle(30, 26, 2);
}

// Fire Hound: very fast (48x48)
export function drawFireHound(g) {
  g.fillStyle(0x000000, 0.25).fillEllipse(24, 43, 36, 6);
  g.lineStyle(2.5, O);
  // Flame tail
  const tail = pts([[10, 26], [0, 16], [6, 18], [2, 8], [12, 22]]);
  g.fillStyle(0xffa31a).fillPoints(tail, true).strokePoints(tail, true);
  g.fillStyle(0x5a1a14);
  for (const x of [12, 18, 30, 36]) g.fillRect(x, 32, 5, 9).strokeRect(x, 32, 5, 9);
  g.fillStyle(0x8a2a1a).fillEllipse(24, 28, 28, 14).strokeEllipse(24, 28, 28, 14);
  g.fillStyle(0xff6a2a).fillEllipse(22, 25, 18, 5);
  g.fillStyle(0x8a2a1a).fillEllipse(38, 19, 16, 12).strokeEllipse(38, 19, 16, 12);
  g.fillStyle(0xffa31a).fillPoints(pts([[32, 14], [34, 5], [38, 13]]), true).fillPoints(pts([[38, 13], [42, 4], [44, 14]]), true);
  g.fillStyle(0xffe14d).fillCircle(41, 18, 2.5);
  g.lineStyle(2, O).lineBetween(40, 23, 46, 22);
}

// Magma Brute: armored, enrages when hurt (56x56)
export function drawMagmaBrute(g) {
  g.fillStyle(0x000000, 0.25).fillEllipse(28, 52, 44, 8);
  g.lineStyle(2.5, O);
  g.fillStyle(0x3a2a2a);
  g.fillRect(14, 38, 10, 12).strokeRect(14, 38, 10, 12);
  g.fillRect(32, 38, 10, 12).strokeRect(32, 38, 10, 12);
  g.fillStyle(0x4a3434).fillEllipse(8, 30, 14, 18).strokeEllipse(8, 30, 14, 18);
  g.fillEllipse(48, 30, 14, 18).strokeEllipse(48, 30, 14, 18);
  g.fillStyle(0x5a4040).fillRoundedRect(9, 18, 38, 24, 9).strokeRoundedRect(9, 18, 38, 24, 9);
  // Glowing lava cracks
  g.lineStyle(2.5, 0xff8a1a);
  g.strokePoints(pts([[16, 22], [22, 30], [18, 38]]));
  g.strokePoints(pts([[36, 21], [32, 29], [38, 37]]));
  g.lineStyle(2.5, O);
  g.fillStyle(0x5a4040).fillEllipse(28, 13, 24, 18).strokeEllipse(28, 13, 24, 18);
  g.fillStyle(0xffa31a).fillPoints(pts([[20, 8], [17, 0], [24, 6]]), true).fillPoints(pts([[36, 8], [39, 0], [32, 6]]), true);
  eyes(g, 23, 33, 13, 0xffa31a);
}

// Ember Wisp: a flying flame that heals the others (48x48)
export function drawEmberWisp(g) {
  g.lineStyle(2.5, O);
  const flame = pts([[24, 2], [33, 14], [38, 26], [34, 38], [24, 43], [14, 38], [10, 26], [15, 14]]);
  g.fillStyle(0xff6a1a).fillPoints(flame, true).strokePoints(flame, true);
  g.fillStyle(0xffa31a).fillPoints(pts([[24, 12], [30, 22], [31, 32], [24, 38], [17, 32], [18, 22]]), true);
  g.fillStyle(0xffe14d).fillEllipse(24, 30, 10, 12);
  g.fillStyle(O).fillCircle(21, 28, 2).fillCircle(27, 28, 2);
  // A green spark: it heals
  g.fillStyle(0x9bff7a).fillRect(35, 6, 3, 9).fillRect(32, 9, 9, 3);
}

// Mini boss: Lava Titan, a walking rock of magma (80x80)
export function drawLavaTitan(g) {
  g.fillStyle(0x000000, 0.28).fillEllipse(40, 75, 64, 10);
  g.lineStyle(3, O);
  g.fillStyle(0x3a2a2a);
  g.fillRect(20, 56, 15, 16).strokeRect(20, 56, 15, 16);
  g.fillRect(45, 56, 15, 16).strokeRect(45, 56, 15, 16);
  g.fillStyle(0x4a3434);
  g.fillCircle(10, 40, 11).strokeCircle(10, 40, 11).fillCircle(70, 40, 11).strokeCircle(70, 40, 11);
  g.fillStyle(0x5a4040).fillRoundedRect(14, 22, 52, 38, 12).strokeRoundedRect(14, 22, 52, 38, 12);
  g.lineStyle(3, 0xff8a1a);
  g.strokePoints(pts([[24, 28], [30, 40], [26, 54]]));
  g.strokePoints(pts([[52, 26], [48, 38], [56, 52]]));
  g.strokePoints(pts([[38, 44], [44, 50]]));
  g.lineStyle(3, O);
  g.fillStyle(0x6a4a4a).fillRoundedRect(28, 4, 24, 20, 6).strokeRoundedRect(28, 4, 24, 20, 6);
  g.fillStyle(0xffa31a).fillRect(31, 12, 7, 4).fillRect(42, 12, 7, 4);
  g.fillStyle(0xff6a1a, 0.8).fillCircle(40, 2, 4);
}

// Big boss: Inferno Lord Pyrax, a fire demon with wings (100x100)
export function drawPyrax(g) {
  g.fillStyle(0x000000, 0.3).fillEllipse(50, 95, 76, 12);
  g.lineStyle(3, O);
  const wingL = pts([[34, 40], [4, 12], [10, 34], [0, 52], [26, 56]]);
  const wingR = pts([[66, 40], [96, 12], [90, 34], [100, 52], [74, 56]]);
  g.fillStyle(0x6a1a1a).fillPoints(wingL, true).strokePoints(wingL, true);
  g.fillPoints(wingR, true).strokePoints(wingR, true);
  g.fillStyle(0x2a1414);
  g.fillRect(34, 70, 13, 20).strokeRect(34, 70, 13, 20);
  g.fillRect(53, 70, 13, 20).strokeRect(53, 70, 13, 20);
  g.fillStyle(0xa82a1a).fillRoundedRect(26, 36, 48, 40, 10).strokeRoundedRect(26, 36, 48, 40, 10);
  g.fillStyle(0x3a2020).fillRoundedRect(31, 40, 38, 20, 6).strokeRoundedRect(31, 40, 38, 20, 6);
  g.fillStyle(0xffa31a).fillCircle(50, 50, 5);
  // Head with flame hair and horns
  g.fillStyle(0xff6a1a).fillPoints(pts([[34, 22], [38, 2], [44, 14], [50, 0], [56, 14], [62, 2], [66, 22]]), true);
  g.fillStyle(0xc83a2a).fillEllipse(50, 26, 30, 26).strokeEllipse(50, 26, 30, 26);
  const hornL = pts([[38, 18], [26, 6], [41, 12]]);
  const hornR = pts([[62, 18], [74, 6], [59, 12]]);
  g.fillStyle(0x2a1414).fillPoints(hornL, true).strokePoints(hornL, true);
  g.fillPoints(hornR, true).strokePoints(hornR, true);
  eyes(g, 44, 56, 26, 0xffe14d);
  g.lineStyle(2, O).lineBetween(45, 34, 55, 34);
}
