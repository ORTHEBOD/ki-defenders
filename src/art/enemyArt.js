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
