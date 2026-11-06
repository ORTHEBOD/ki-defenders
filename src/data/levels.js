// The 3 maps and where each level's button sits on the level map screen.
// Levels that aren't in LEVELS yet show as "coming soon".
export const MAPS = [
  { name: 'Green Valley', color: 0x4f9a3a, levels: [1, 2, 3, 4], nodes: [[220, 500], [480, 380], [760, 490], [1040, 330]] },
  { name: 'Desert Wasteland', color: 0xc98a3a, levels: [5, 6, 7], nodes: [[260, 440], [640, 330], [1020, 470]] },
  { name: 'Enemy Mothership', color: 0x6a5aa8, levels: [8, 9, 10], nodes: [[260, 480], [640, 340], [1020, 440]] },
];

// Each wave is a list of groups. A group spawns `count` enemies, one every `interval` seconds,
// starting `delay` seconds after the wave starts. hpScale makes that group tougher.

export const LEVELS = [
  {
    id: 1,
    map: 'Green Valley',
    name: 'Level 1: The Valley Road',
    startKi: 150,
    lives: 20,
    path: [[-40, 200], [320, 200], [320, 500], [640, 500], [640, 260], [960, 260], [960, 560], [1230, 560]],
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
  },
  {
    id: 4,
    map: 'Green Valley',
    name: 'Level 4: Boulder Field',
    startKi: 300,
    lives: 20,
    // Maze level: no road. A 17 x 9 grid of 64px cells; enemies enter on the left at entryRow
    // and leave on the right at exitRow. Rocks are cells that are blocked from the start.
    maze: {
      cols: 17,
      rows: 9,
      entryRow: 4,
      exitRow: 4,
      rocks: [
        [3, 0], [3, 1], [3, 7], [3, 8], [6, 4], [7, 4],
        [10, 0], [10, 1], [10, 2], [10, 6], [10, 7], [10, 8], [14, 3], [14, 5],
      ],
    },
    waves: [
      { groups: [{ type: 'grunt', count: 10, interval: 1.0 }] },
      { groups: [
        { type: 'grunt', count: 8, interval: 0.9 },
        { type: 'flyer', count: 5, interval: 1.0, delay: 4 },
      ] },
      { groups: [
        { type: 'splitter', count: 8, interval: 1.0 },
        { type: 'runner', count: 10, interval: 0.5, delay: 3, hpScale: 1.2 },
      ] },
      { groups: [
        { type: 'brute', count: 4, interval: 2.5, hpScale: 1.2 },
        { type: 'medic', count: 3, interval: 2.5, delay: 2 },
        { type: 'grunt', count: 12, interval: 0.6, delay: 1, hpScale: 1.6 },
      ] },
      { groups: [
        { type: 'flyer', count: 10, interval: 0.7, hpScale: 1.6 },
        { type: 'splitter', count: 10, interval: 0.7, delay: 3, hpScale: 1.6 },
        { type: 'brute', count: 4, interval: 2.0, delay: 6, hpScale: 1.3 },
      ] },
      { groups: [
        { type: 'grunt', count: 18, interval: 0.5, hpScale: 1.9 },
        { type: 'medic', count: 4, interval: 3.0, delay: 2, hpScale: 1.8 },
        { type: 'krag', count: 1, interval: 1, delay: 6 },
        { type: 'runner', count: 14, interval: 0.3, delay: 9, hpScale: 2.0 },
      ] },
    ],
  },
];
