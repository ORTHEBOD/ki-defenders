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
