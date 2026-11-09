// Base upgrades: bought with coins on the Base page, and kept for every battle.
// Each upgrade has 5 levels. `cost[i]` is the price of level i + 1.
export const BASE_UPGRADES = [
  {
    key: 'walls', name: 'Strong Walls', color: 0xc9a36a,
    desc: 'More lives: enemies need to break through more walls.',
    cost: [300, 600, 1000, 1600, 2500],
    effect: (lv) => `+${lv * 2} lives`,
  },
  {
    key: 'reactor', name: 'Ki Reactor', color: 0x5ad8ff,
    desc: 'Start every battle with more Ki to build fighters.',
    cost: [250, 500, 900, 1400, 2200],
    effect: (lv) => `+${lv * 20} starting Ki`,
  },
  {
    key: 'cannon', name: 'Base Cannon', color: 0xff8a3d,
    desc: 'A cannon on the base shoots enemies that come close.',
    cost: [400, 800, 1300, 2000, 3000],
    effect: (lv) => (lv ? `${cannonStats(lv).damage} damage, range ${cannonStats(lv).range}` : 'No cannon yet'),
  },
];

export const BASE_MAX = 5;

// The levels the player has bought (the tester account has everything)
export function baseLevels(player) {
  const lv = (key) => (player?.super ? BASE_MAX : Math.min(BASE_MAX, player?.base?.[key] ?? 0));
  return { walls: lv('walls'), reactor: lv('reactor'), cannon: lv('cannon') };
}

export const baseLives = (lv) => lv.walls * 2;
export const baseKi = (lv) => lv.reactor * 20;

// Cannon: a shot every `every` seconds at the closest enemy in range
export function cannonStats(level) {
  return { damage: Math.round(14 * 1.6 ** (level - 1)), range: 150 + level * 15, every: 1.3 - level * 0.08 };
}
