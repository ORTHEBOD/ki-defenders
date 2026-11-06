// All fighter (tower) data lives here: names, looks and stats.
// To rename a character or change its art later, only this file changes.
// levels[0] is the starting level; levels[1..] are upgrades (Phase 2 turns these into transformations).

export const FIGHTERS = {
  kaito: {
    name: 'Kaito',
    role: 'Brawler',
    texture: 'kaito',
    cost: 60,
    attack: 'punch',
    color: 0xffb347,
    look: { gi: 0xf47d20, hair: 0x2b2b3a, belt: 0x2f55c4, skin: 0xf4c595, boots: 0x2f55c4 },
    levels: [
      { damage: 12, range: 140, cooldown: 0.45 },
      { damage: 18, range: 150, cooldown: 0.4, cost: 70 },
      { damage: 28, range: 160, cooldown: 0.33, cost: 120 },
    ],
  },
  ronin: {
    name: 'Ronin',
    role: 'Beam sniper',
    texture: 'ronin',
    cost: 90,
    attack: 'beam',
    color: 0x3fd0f5,
    look: { gi: 0x2f3f8f, hair: 0xd8dde8, belt: 0xc0392b, skin: 0xe8b98a, boots: 0x1a1a1a },
    levels: [
      { damage: 28, range: 250, cooldown: 1.6 },
      { damage: 42, range: 270, cooldown: 1.45, cost: 100 },
      { damage: 65, range: 290, cooldown: 1.3, cost: 160 },
    ],
  },
};
