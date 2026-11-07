import { distToSegment } from '../systems/Path.js';

// The 3 maps (areas). Each has 10 levels, a look (theme) for the battle field,
// and needs a number of stars (plus the last level of the map before it) to open.
export const MAPS = [
  {
    name: 'Green Valley', color: 0x4f9a3a, needStars: 0,
    theme: {
      ground: 0x6fb552, blobs: [0x64a84a, 0x7cc25e, 0x5d9e44], edge: 0xa8864f, road: 0xe0c08c, pebble: 0xc9a66b,
      deco: ['tree', 'tree', 'rock', 'bush'], boulder: 0x8c8f99,
    },
    miniBoss: 'ogre', boss: 'krag', music: 'battle',
  },
  {
    name: 'Desert Wasteland', color: 0xc98a3a, needStars: 15,
    theme: {
      ground: 0xe2b86a, blobs: [0xd6a858, 0xecc684, 0xc99a4a], edge: 0x9a6a3a, road: 0xc48a52, pebble: 0xa87040,
      deco: ['cactus', 'cactus', 'sandrock', 'bones'], boulder: 0xb8865a,
    },
    miniBoss: 'scorpion', boss: 'sandKing', music: 'desert',
  },
  {
    name: 'Enemy Mothership', color: 0x6a5aa8, needStars: 40,
    theme: {
      ground: 0x3a4152, blobs: [0x343a4a, 0x40485a, 0x2e3442], edge: 0x1a1d28, road: 0x5a6378, pebble: 0x3fd0f5,
      deco: ['crate', 'light', 'pipe', 'crate'], boulder: 0x5a6378, metal: true,
    },
    miniBoss: 'mech', boss: 'vorn', music: 'ship',
  },
];

// Where each level button sits on the level map screen (same layout for every map)
export const NODES = [
  [140, 560], [270, 420], [170, 270], [360, 220], [500, 360],
  [650, 500], [800, 380], [740, 230], [930, 230], [1090, 380],
];

const NAMES = [
  ['The Valley Road', 'Riverside', 'Old Bridge', 'Boulder Field', 'Farm Fields',
    'Forest Edge', 'Hilltop Village', 'Stone Maze', 'Waterfall Pass', 'Krag\'s Camp'],
  ['Dust Road', 'Dry Canyon', 'Sun Temple', 'Sand Maze', 'Ruined Town',
    'Scorpion Nest', 'Mirage Oasis', 'Dune Labyrinth', 'Bone Valley', 'Throne of Sand'],
  ['Landing Bay', 'Cargo Hold', 'Engine Room', 'Prison Maze', 'Laser Halls',
    'Reactor Core', 'Command Deck', 'Circuit Maze', 'Bridge Gate', 'Emperor\'s Throne'],
];

// Road shapes. Enemies start at the first point (left side) and the base is at the last one.
const ROADS = [
  [[-40, 200], [320, 200], [320, 500], [640, 500], [640, 260], [960, 260], [960, 560], [1230, 560]],
  [[-40, 360], [240, 360], [240, 140], [560, 140], [560, 560], [880, 560], [880, 240], [1230, 240]],
  [[-40, 140], [1080, 140], [1080, 330], [200, 330], [200, 530], [1230, 530]],
  [[-40, 560], [200, 560], [200, 160], [440, 160], [440, 450], [760, 450], [760, 160], [1040, 160], [1040, 400], [1230, 400]],
  [[-40, 300], [160, 300], [160, 120], [1120, 120], [1120, 560], [380, 560], [380, 340], [800, 340]],
  [[-40, 120], [300, 520], [620, 160], [940, 540], [1230, 300]],
  [[-40, 450], [260, 450], [260, 180], [700, 180], [700, 560], [1000, 560], [1000, 300], [1230, 300]],
  [[-40, 180], [520, 180], [520, 400], [180, 400], [180, 580], [1100, 580], [1100, 280], [1230, 280]],
];

// Which road each fixed level of a map uses, and whether it is flipped upside down
const ROAD_ORDER = [
  [[0, false], [1, false], [2, false], [3, false], [5, false], [6, false], [7, false], [4, false]],
  [[1, true], [5, true], [3, true], [6, true], [2, true], [0, true], [7, true], [4, true]],
  [[6, false], [2, true], [7, false], [0, true], [3, false], [5, true], [1, false], [4, true]],
];

// Tiny seeded random numbers, so every level is the same each time
function rng(seed) {
  let a = seed * 9301 + 49297;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function distToRoad(road, x, y) {
  let min = Infinity;
  for (let i = 0; i < road.length - 1; i++) {
    min = Math.min(min, distToSegment(x, y, road[i][0], road[i][1], road[i + 1][0], road[i + 1][1]));
  }
  return min;
}

// Build spots next to the road: close enough to reach it, never on it or under the buttons.
// Spots that can see the most road are picked first.
export function spotsFor(road, count = 13) {
  const end = road[road.length - 1];
  const cands = [];
  for (let y = 100; y <= 600; y += 20) {
    for (let x = 50; x <= 1230; x += 20) {
      const d = distToRoad(road, x, y);
      if (d < 64 || d > 92) continue;
      if ((x < 360 || (x > 570 && x < 970)) && y > 590) continue;
      if (Math.hypot(x - end[0], y - end[1]) < 100 || x < 90) continue;
      let seen = 0;
      for (let i = 0; i < road.length - 1; i++) {
        const [ax, ay] = road[i];
        const [bx, by] = road[i + 1];
        const len = Math.hypot(bx - ax, by - ay);
        for (let s = 0; s < len; s += 20) {
          if (Math.hypot(ax + ((bx - ax) * s) / len - x, ay + ((by - ay) * s) / len - y) < 150) seen++;
        }
      }
      cands.push({ x, y, seen });
    }
  }
  cands.sort((a, b) => b.seen - a.seen);
  const out = [];
  for (const c of cands) {
    if (out.length >= count) break;
    if (out.some(([x, y]) => Math.hypot(x - c.x, y - c.y) < 84)) continue;
    out.push([c.x, c.y]);
  }
  return out;
}

// Random boulders for a maze level, always leaving a way through
function mazeFor(n, rand) {
  const cols = 17;
  const rows = 9;
  const entryRow = 2 + Math.floor(rand() * 5);
  const exitRow = 2 + Math.floor(rand() * 5);
  const rocks = [];
  const want = 11 + (n % 10 === 8 ? 5 : 0) + Math.floor(n / 10) * 2;
  const has = (c, r) => rocks.some(([a, b]) => a === c && b === r);
  for (let tries = 0; rocks.length < want && tries < 500; tries++) {
    const c = 2 + Math.floor(rand() * (cols - 4));
    const r = Math.floor(rand() * rows);
    if (has(c, r)) continue;
    rocks.push([c, r]);
    if (!mazeOpen(cols, rows, entryRow, exitRow, rocks)) rocks.pop();
  }
  return { cols, rows, entryRow, exitRow, rocks };
}

function mazeOpen(cols, rows, entryRow, exitRow, rocks) {
  const blocked = new Set(rocks.map(([c, r]) => `${c},${r}`));
  const seen = new Set([`0,${entryRow}`]);
  const queue = [[0, entryRow]];
  while (queue.length) {
    const [c, r] = queue.shift();
    if (c === cols - 1 && r === exitRow) return true;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = `${c + dc},${r + dr}`;
      if (c + dc < 0 || r + dr < 0 || c + dc >= cols || r + dr >= rows || blocked.has(k) || seen.has(k)) continue;
      seen.add(k);
      queue.push([c + dc, r + dr]);
    }
  }
  return false;
}

// Which enemies can show up by level number (1-30)
function enemyPool(n) {
  const pool = ['runner'];
  if (n >= 3) pool.push('brute');
  if (n >= 5) pool.push('flyer');
  if (n >= 6) pool.push('splitter');
  if (n >= 7) pool.push('medic');
  if (n >= 13) pool.push('flyer', 'brute');
  return pool;
}

// Waves get bigger and tougher through each level and from level to level.
// The last wave always brings the map's boss: a mini boss, or the big boss on level 10, 20 and 30.
export function makeWaves(n, mapIndex, rand) {
  const count = Math.min(10, 5 + Math.floor((n - 1) / 3));
  const base = 1 + 0.06 * (n - 1);
  const pool = enemyPool(n);
  const waves = [];
  for (let w = 0; w < count; w++) {
    const t = w / (count - 1);
    const hp = +(base * (1 + 1.3 * t)).toFixed(2);
    const groups = [{ type: 'grunt', count: 8 + w * 2, interval: +(1.0 - 0.5 * t).toFixed(2), hpScale: hp }];
    if (w > 0) {
      const type = pool[Math.floor(rand() * pool.length)];
      const heavy = type === 'brute' || type === 'medic';
      groups.push({
        type, count: heavy ? 2 + Math.floor(w / 2) : 4 + w, interval: heavy ? 2.2 : 0.6, delay: 4, hpScale: +(hp * 0.9).toFixed(2),
      });
    }
    if (t > 0.5) {
      const type = pool[Math.floor(rand() * pool.length)];
      groups.push({ type, count: 3 + w, interval: 0.7, delay: 9, hpScale: +(hp * 0.85).toFixed(2) });
    }
    waves.push({ groups });
  }
  const bossLevel = n % 10 === 0;
  const boss = bossLevel ? MAPS[mapIndex].boss : MAPS[mapIndex].miniBoss;
  waves[count - 1].groups.push({ type: boss, count: 1, interval: 1, delay: 8, hpScale: +(bossLevel ? 1 : base).toFixed(2) });
  return waves;
}

function buildLevels() {
  const levels = [];
  for (let m = 0; m < 3; m++) {
    let fixed = 0;
    for (let i = 1; i <= 10; i++) {
      const id = m * 10 + i;
      const rand = rng(id * 7919);
      const level = {
        id,
        map: m,
        name: `Level ${id}: ${NAMES[m][i - 1]}`,
        startKi: Math.min(450, 160 + 10 * (id - 1)),
        lives: 20,
      };
      if (i === 4 || i === 8) {
        level.maze = mazeFor(id, rand);
        level.startKi += 80;
      } else {
        const [r, flip] = ROAD_ORDER[m][fixed++];
        level.path = ROADS[r].map(([x, y]) => [x, flip ? 704 - y : y]);
        level.spots = spotsFor(level.path);
      }
      level.waves = makeWaves(id, m, rand);
      levels.push(level);
    }
  }
  return levels;
}

export const LEVELS = buildLevels();

// Level 1 is hand-tuned as the first taste of the game
Object.assign(LEVELS[0], {
  spots: [
    [160, 120], [240, 280], [400, 420], [240, 580], [480, 580], [560, 420],
    [720, 340], [800, 180], [880, 340], [1040, 180], [1040, 480], [1120, 640],
  ],
  waves: [
    { groups: [{ type: 'grunt', count: 8, interval: 1.1 }] },
    { groups: [
      { type: 'grunt', count: 10, interval: 0.9 },
      { type: 'runner', count: 5, interval: 0.7, delay: 6 },
    ] },
    { groups: [
      { type: 'runner', count: 12, interval: 0.5 },
      { type: 'grunt', count: 6, interval: 1.0, delay: 3, hpScale: 1.2 },
    ] },
    { groups: [
      { type: 'grunt', count: 16, interval: 0.6, hpScale: 2.0 },
      { type: 'runner', count: 12, interval: 0.35, delay: 6, hpScale: 1.8 },
    ] },
    { groups: [
      { type: 'grunt', count: 22, interval: 0.45, hpScale: 2.8 },
      { type: 'runner', count: 18, interval: 0.3, delay: 4, hpScale: 2.4 },
      { type: 'ogre', count: 1, interval: 1, delay: 10 },
    ] },
  ],
});

// Level 4 (the first maze) keeps its hand-made field
Object.assign(LEVELS[3], {
  startKi: 300,
  maze: {
    cols: 17, rows: 9, entryRow: 4, exitRow: 4,
    rocks: [
      [3, 0], [3, 1], [3, 7], [3, 8], [6, 4], [7, 4],
      [10, 0], [10, 1], [10, 2], [10, 6], [10, 7], [10, 8], [14, 3], [14, 5],
    ],
  },
});

// Endless mode: one long road, waves never stop. The best wave reached goes on the leaderboard.
export const ENDLESS = {
  id: 'endless',
  map: 0,
  name: 'Endless Battle',
  startKi: 300,
  lives: 20,
  path: ROADS[2],
  spots: spotsFor(ROADS[2], 15),
  endless: true,
  waves: [],
};

// The waves for endless mode, made one at a time (w starts at 0)
export function endlessWave(w) {
  const pool = enemyPool(Math.min(30, 3 + w));
  const rand = rng(1000 + w);
  const hp = +(Math.pow(1.13, w)).toFixed(2);
  const groups = [{ type: 'grunt', count: 8 + Math.min(20, w), interval: Math.max(0.3, 1 - w * 0.03), hpScale: hp }];
  if (w > 0) {
    const type = pool[Math.floor(rand() * pool.length)];
    groups.push({ type, count: 3 + Math.min(14, Math.floor(w / 2)), interval: 0.7, delay: 4, hpScale: hp });
  }
  if ((w + 1) % 10 === 0) {
    const bosses = ['ogre', 'scorpion', 'mech', 'krag', 'sandKing', 'vorn'];
    groups.push({
      type: bosses[Math.floor((w + 1) / 10 - 1) % bosses.length], count: 1, interval: 1, delay: 6,
      hpScale: +(Math.pow(1.08, w)).toFixed(2),
    });
  }
  return { groups };
}

export function levelById(id) {
  return id === 'endless' ? ENDLESS : LEVELS.find((l) => l.id === id);
}
