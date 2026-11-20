import { MAPS, nodesFor } from '../data/levels.js';

// The level map of an area: its ground, a road joining the levels, and scenery.
// Scenery is placed with a fixed seed, so it looks the same every visit.

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function nearRoad(NODES, x, y, gap) {
  for (let i = 0; i < NODES.length - 1; i++) {
    const [x1, y1] = NODES[i];
    const [x2, y2] = NODES[i + 1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
    if (Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)) < gap) return true;
  }
  return false;
}

function tree(g, x, y, s, t) {
  g.fillStyle(0x000000, 0.18).fillEllipse(x + 4, y + 4, 34 * s, 14 * s);
  g.fillStyle(0x6b4a2a).fillRect(x - 3 * s, y - 14 * s, 6 * s, 16 * s);
  g.fillStyle(0x2f6e2a).fillCircle(x, y - 22 * s, 15 * s);
  g.fillStyle(0x3f8a34).fillCircle(x - 6 * s, y - 26 * s, 11 * s).fillCircle(x + 7 * s, y - 24 * s, 10 * s);
  g.fillStyle(0x5fae4a).fillCircle(x - 4 * s, y - 31 * s, 7 * s);
  g.fillStyle(0xffffff, 0.12 * t).fillCircle(x - 6 * s, y - 33 * s, 4 * s);
}

function bush(g, x, y, s) {
  g.fillStyle(0x000000, 0.15).fillEllipse(x + 2, y + 3, 30 * s, 10 * s);
  g.fillStyle(0x3f8a34).fillCircle(x - 7 * s, y - 4 * s, 8 * s).fillCircle(x + 6 * s, y - 4 * s, 8 * s);
  g.fillStyle(0x5fae4a).fillCircle(x, y - 8 * s, 9 * s);
  g.fillStyle(0xff7aa8).fillCircle(x - 4 * s, y - 10 * s, 2 * s).fillCircle(x + 5 * s, y - 6 * s, 2 * s);
}

function rock(g, x, y, s, color) {
  g.fillStyle(0x000000, 0.18).fillEllipse(x + 3, y + 4, 30 * s, 10 * s);
  g.fillStyle(color).fillEllipse(x, y - 4 * s, 28 * s, 18 * s);
  g.fillStyle(0xffffff, 0.25).fillEllipse(x - 5 * s, y - 8 * s, 12 * s, 6 * s);
}

function cactus(g, x, y, s) {
  g.fillStyle(0x000000, 0.18).fillEllipse(x + 4, y + 2, 26 * s, 9 * s);
  g.fillStyle(0x3f8a4a).fillRoundedRect(x - 5 * s, y - 38 * s, 10 * s, 40 * s, 5 * s);
  g.fillRoundedRect(x - 15 * s, y - 26 * s, 7 * s, 16 * s, 3 * s).fillRect(x - 15 * s, y - 14 * s, 12 * s, 5 * s);
  g.fillRoundedRect(x + 8 * s, y - 32 * s, 7 * s, 14 * s, 3 * s).fillRect(x + 3 * s, y - 22 * s, 12 * s, 5 * s);
  g.fillStyle(0x6ac27a).fillRect(x - 2 * s, y - 34 * s, 2 * s, 32 * s);
}

function dune(g, x, y, s) {
  g.fillStyle(0xd09a4a, 0.55).fillEllipse(x, y, 140 * s, 36 * s);
  g.fillStyle(0xf4d08a, 0.6).fillEllipse(x - 12 * s, y - 6 * s, 100 * s, 18 * s);
}

function crate(g, x, y, s) {
  g.fillStyle(0x000000, 0.25).fillRect(x - 13 * s + 4, y - 13 * s + 5, 26 * s, 26 * s);
  g.fillStyle(0x5a6378).fillRect(x - 13 * s, y - 13 * s, 26 * s, 26 * s);
  g.lineStyle(2, 0x2a3040).strokeRect(x - 13 * s, y - 13 * s, 26 * s, 26 * s);
  g.lineBetween(x - 13 * s, y - 13 * s, x + 13 * s, y + 13 * s);
  g.fillStyle(0xffd93b).fillRect(x - 13 * s, y - 13 * s, 26 * s, 4 * s);
}

function pine(g, x, y, s) {
  g.fillStyle(0x000000, 0.15).fillEllipse(x + 3, y + 4, 30 * s, 10 * s);
  g.fillStyle(0x6b4a2a).fillRect(x - 3 * s, y - 8 * s, 6 * s, 10 * s);
  for (const [dy, w] of [[-8, 16], [-18, 13], [-28, 9]]) {
    g.fillStyle(0x2f6a4a).fillTriangle(x - w * s, y + dy * s, x, y + (dy - 16) * s, x + w * s, y + dy * s);
    g.fillStyle(0xffffff).fillTriangle(x - w * 0.5 * s, y + (dy - 8) * s, x, y + (dy - 16) * s, x + w * 0.5 * s, y + (dy - 8) * s);
  }
}

function vent(g, x, y, s) {
  g.fillStyle(0xff6a1a, 0.2).fillCircle(x, y, 26 * s);
  g.fillStyle(0xd8401a).fillEllipse(x, y, 40 * s, 18 * s);
  g.fillStyle(0xffa31a).fillEllipse(x - 3, y - 2, 26 * s, 10 * s);
}

function light(g, x, y) {
  g.fillStyle(0x3fd0f5, 0.15).fillCircle(x, y, 22);
  g.fillStyle(0x3fd0f5, 0.35).fillCircle(x, y, 11);
  g.fillStyle(0xbff4ff).fillCircle(x, y, 5);
}

// A white puffy cloud
function cloud(g, x, y, s, alpha) {
  g.fillStyle(0xffffff, alpha * 0.5).fillEllipse(x + 4 * s, y + 10 * s, 110 * s, 34 * s);
  g.fillStyle(0xffffff, alpha);
  [[-34, 0, 26], [-10, -12, 30], [18, -6, 28], [40, 4, 20], [0, 8, 30]].forEach(([dx, dy, r]) => g.fillCircle(x + dx * s, y + dy * s, r * s));
}

// A white marble pillar with gold rings
function pillar(g, x, y, s) {
  g.fillStyle(0x000000, 0.18).fillEllipse(x + 4, y + 4, 34 * s, 10 * s);
  g.lineStyle(2, 0x5a6378).fillStyle(0xf4f6fa);
  g.fillRect(x - 9 * s, y - 46 * s, 18 * s, 48 * s).strokeRect(x - 9 * s, y - 46 * s, 18 * s, 48 * s);
  g.fillStyle(0xd6dde8).fillRect(x + 3 * s, y - 46 * s, 5 * s, 48 * s);
  g.fillStyle(0xd8b45a).fillRect(x - 13 * s, y - 52 * s, 26 * s, 7 * s).fillRect(x - 13 * s, y - 2 * s, 26 * s, 6 * s);
}

// A small golden lantern on a stand
function lantern(g, x, y, s) {
  g.fillStyle(0xffd93b, 0.18).fillCircle(x, y - 22 * s, 22 * s);
  g.lineStyle(3, 0x6a5a3a).lineBetween(x, y, x, y - 16 * s);
  g.lineStyle(2, 0x5a4a2a).fillStyle(0xffc93b).fillRoundedRect(x - 7 * s, y - 30 * s, 14 * s, 16 * s, 4).strokeRoundedRect(x - 7 * s, y - 30 * s, 14 * s, 16 * s, 4);
  g.fillStyle(0xfff6c0).fillRect(x - 3 * s, y - 27 * s, 6 * s, 10 * s);
}

export function drawAreaMap(scene, mapIndex) {
  const map = MAPS[mapIndex];
  const NODES = nodesFor(map);
  const t = map.theme;
  const X = 40;
  const Y = 150;
  const W = 1200;
  const H = 550;
  const rand = rng(1000 + mapIndex * 77);
  const g = scene.add.graphics();

  // Ground
  g.fillStyle(t.ground).fillRoundedRect(X, Y, W, H, 20);

  if (t.metal) {
    // Ship floor: plates with rivets and glowing seams
    for (let px = X + 20; px < X + W - 20; px += 120) {
      for (let py = Y + 20; py < Y + H - 20; py += 105) {
        g.fillStyle(t.blobs[(px / 120 + py / 105) % 2 < 1 ? 0 : 1]).fillRect(px + 3, py + 3, 114, 99);
        g.fillStyle(0x6a7388).fillCircle(px + 10, py + 10, 2.5).fillCircle(px + 110, py + 10, 2.5)
          .fillCircle(px + 10, py + 95, 2.5).fillCircle(px + 110, py + 95, 2.5);
      }
    }
    g.lineStyle(2, 0x3fd0f5, 0.25);
    for (let py = Y + 20; py < Y + H - 20; py += 105) g.lineBetween(X + 20, py, X + W - 20, py);
  } else {
    // Soft patches of lighter and darker ground
    for (let i = 0; i < 26; i++) {
      g.fillStyle(t.blobs[i % t.blobs.length], 0.8)
        .fillEllipse(X + 60 + rand() * (W - 120), Y + 50 + rand() * (H - 100), 90 + rand() * 160, 40 + rand() * 60);
    }
    if (mapIndex === 1) for (let i = 0; i < 7; i++) dune(g, X + 90 + rand() * (W - 180), Y + 60 + rand() * (H - 120), 0.8 + rand() * 0.6);
    else if (t.sky) {
      // Floating islands in a blue sky: the temple floor is white marble with gold lines
      g.fillStyle(0x8fcff5).fillRoundedRect(X, Y, W, H, 20);
      for (let i = 0; i < 14; i++) cloud(g, X + rand() * W, Y + rand() * H, 0.8 + rand() * 1.2, 0.7);
      g.fillStyle(t.ground).fillRoundedRect(X + 60, Y + 50, W - 120, H - 100, 60);
      g.lineStyle(2, 0xd8b45a, 0.5);
      for (let x = X + 120; x < X + W - 60; x += 90) g.lineBetween(x, Y + 50, x, Y + H - 50);
      for (let y = Y + 110; y < Y + H - 50; y += 90) g.lineBetween(X + 60, y, X + W - 60, y);
    } else {
      // A river across the valley: a frozen one in the Peaks, a lava flow in the Volcano
      const [water, shine] = t.lava ? [0xe0501a, 0xffd93b] : t.snow ? [0x9fd4f5, 0xffffff] : [0x3f8ad8, 0xbfe6ff];
      g.lineStyle(30, water, 0.85);
      g.beginPath().moveTo(X + 10, Y + 120);
      for (let x = X + 10; x <= X + W - 10; x += 40) g.lineTo(x, Y + 110 + Math.sin(x / 90) * 26 + (x - X) * 0.05);
      g.strokePath();
      g.lineStyle(8, shine, 0.45);
      g.beginPath().moveTo(X + 10, Y + 114);
      for (let x = X + 10; x <= X + W - 10; x += 40) g.lineTo(x, Y + 104 + Math.sin(x / 90) * 26 + (x - X) * 0.05);
      g.strokePath();
    }
  }

  // The road between levels: a dark edge, the road, and a dashed centre line
  const road = (width, color, alpha = 1) => {
    g.lineStyle(width, color, alpha);
    g.beginPath().moveTo(NODES[0][0], NODES[0][1]);
    NODES.slice(1).forEach(([x, y]) => g.lineTo(x, y));
    g.strokePath();
    g.fillStyle(color, alpha);
    NODES.forEach(([x, y]) => g.fillCircle(x, y, width / 2));
  };
  road(40, 0x000000, 0.18);
  road(34, t.edge);
  road(24, t.road);
  g.fillStyle(0xffffff, t.metal ? 0.5 : 0.35);
  for (let n = 0; n < NODES.length - 1; n++) {
    const [x1, y1] = NODES[n];
    const [x2, y2] = NODES[n + 1];
    const steps = Math.floor(Math.hypot(x2 - x1, y2 - y1) / 22);
    for (let s = 1; s < steps; s++) g.fillCircle(x1 + ((x2 - x1) * s) / steps, y1 + ((y2 - y1) * s) / steps, 2.5);
  }

  // Scenery, kept off the road, sorted so things lower down are drawn in front
  const items = [];
  for (let tries = 0; tries < 400 && items.length < 34; tries++) {
    const x = X + 40 + rand() * (W - 80);
    const y = Y + 50 + rand() * (H - 80);
    if (nearRoad(NODES, x, y, 62) || (y > Y + H - 60 && x > X + W - 300)) continue;
    if (items.some((it) => Math.hypot(it.x - x, it.y - y) < 46)) continue;
    items.push({ x, y, kind: t.deco[Math.floor(rand() * t.deco.length)], s: 0.8 + rand() * 0.5 });
  }
  items.sort((a, b) => a.y - b.y).forEach(({ x, y, kind, s }) => {
    if (kind === 'tree') tree(g, x, y, s, 1);
    else if (kind === 'bush') bush(g, x, y, s);
    else if (kind === 'rock' || kind === 'sandrock') rock(g, x, y, s, t.boulder);
    else if (kind === 'cactus') cactus(g, x, y, s);
    else if (kind === 'bones') rock(g, x, y, s * 0.6, 0xf0e6d0);
    else if (kind === 'crate') crate(g, x, y, s);
    else if (kind === 'pine') pine(g, x, y, s);
    else if (kind === 'icerock') rock(g, x, y, s, 0x9fd4f5);
    else if (kind === 'snowbush') bush(g, x, y, s);
    else if (kind === 'lavarock') rock(g, x, y, s, 0x3a2a2a);
    else if (kind === 'vent') vent(g, x, y, s);
    else if (kind === 'deadtree') {
      g.lineStyle(4 * s, 0x2a1e1a).lineBetween(x, y, x, y - 30 * s).lineBetween(x, y - 16 * s, x - 10 * s, y - 26 * s)
        .lineBetween(x, y - 22 * s, x + 9 * s, y - 32 * s);
    }
    else if (kind === 'light') light(g, x, y);
    else if (kind === 'pillar') pillar(g, x, y, s);
    else if (kind === 'cloud') cloud(g, x, y, s * 0.6, 1);
    else if (kind === 'lantern') lantern(g, x, y, s);
    else if (kind === 'pipe') {
      g.fillStyle(0x2a3040).fillRoundedRect(x - 30 * s, y - 6, 60 * s, 12, 6);
      g.fillStyle(0x7a8398).fillRect(x - 30 * s, y - 5, 60 * s, 3);
    }
  });

  // Keep everything inside the frame
  const clip = scene.make.graphics({ add: false });
  clip.fillStyle(0xffffff).fillRoundedRect(X, Y, W, H, 20);
  g.setMask(clip.createGeometryMask());

  // Soft dark edge inside the frame, then the frame (drawn unclipped on top)
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.4).fillRoundedRect(X + 5, Y + 8, W, H, 22);
  const f = scene.add.graphics();
  for (let i = 0; i < 6; i++) f.lineStyle(10, 0x000000, 0.06).strokeRoundedRect(X + 5 + i * 4, Y + 5 + i * 4, W - 10 - i * 8, H - 10 - i * 8, 18);
  f.lineStyle(5, map.color).strokeRoundedRect(X, Y, W, H, 20);
  f.lineStyle(2, 0xffffff, 0.25).strokeRoundedRect(X + 4, Y + 4, W - 8, H - 8, 17);
  return [shadow, g, f];
}

// A level button: shadow, shaded disc and shine
export function drawLevelNode(scene, x, y, r, fill, ring) {
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.35).fillEllipse(x + 3, y + r * 0.75, r * 2.1, r * 0.8);
  g.fillStyle(ring).fillCircle(x, y, r + 5);
  g.fillStyle(Phaser.Display.Color.ValueToColor(fill).darken(25).color).fillCircle(x, y, r);
  g.fillStyle(fill).fillCircle(x, y - 3, r - 4);
  g.fillStyle(0xffffff, 0.28).fillEllipse(x - r * 0.25, y - r * 0.45, r * 1.1, r * 0.5);
  return g;
}
