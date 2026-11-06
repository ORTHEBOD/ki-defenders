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
      ] },
    ],
  },
];
