// Everything the shop sells. Coins are won in every battle.

// Equipment: each hero can wear one item per slot. Bought items can be worn by any hero.
// stats: damage / hp / speed / attackSpeed / range / coins = +%, cooldown = -% ability recharge time,
// regen = extra healing speed (2 = heals 3x faster).
// tier: 1 = Common (hero level 5), 2 = Rare (hero level 10), 3 = Epic (hero level 15). See Progress.js.
export const GEAR_SLOTS = [
  { key: 'weapon', name: 'Weapon' },
  { key: 'armor', name: 'Armor' },
  { key: 'pants', name: 'Pants' },
  { key: 'boots', name: 'Boots' },
  { key: 'amulet', name: 'Amulet' },
  { key: 'accessory', name: 'Accessory' },
];

export const GEAR = {
  trainingGloves: { tier: 1, slot: 'weapon', name: 'Training Gloves', cost: 250, color: 0xc98a3a, stats: { damage: 0.1 } },
  powerBracers: { tier: 2, slot: 'weapon', name: 'Power Bracers', cost: 800, color: 0x8c8f99, stats: { damage: 0.2 } },
  dragonGauntlets: { tier: 3, slot: 'weapon', name: 'Dragon Gauntlets', cost: 2200, color: 0xffd93b, stats: { damage: 0.35 } },

  clothVest: { tier: 1, slot: 'armor', name: 'Cloth Vest', cost: 250, color: 0xc98a3a, stats: { hp: 0.15 } },
  battleArmor: { tier: 2, slot: 'armor', name: 'Battle Armor', cost: 800, color: 0x8c8f99, stats: { hp: 0.3 } },
  divineArmor: { tier: 3, slot: 'armor', name: 'Divine Armor', cost: 2200, color: 0x5ad8ff, stats: { hp: 0.5, damage: 0.05 } },

  trainingPants: { tier: 1, slot: 'pants', name: 'Training Pants', cost: 220, color: 0x3a6ad8, stats: { hp: 0.08, speed: 0.05 } },
  weightedPants: { tier: 2, slot: 'pants', name: 'Weighted Pants', cost: 750, color: 0x6a4a9a, stats: { hp: 0.15, speed: 0.1 } },
  dragonPants: { tier: 3, slot: 'pants', name: 'Dragon Gi Pants', cost: 2000, color: 0xe0661a, stats: { hp: 0.25, speed: 0.15, damage: 0.05 } },

  sandals: { tier: 1, slot: 'boots', name: 'Swift Sandals', cost: 200, color: 0xc98a3a, stats: { speed: 0.12 } },
  windBoots: { tier: 2, slot: 'boots', name: 'Wind Boots', cost: 700, color: 0x8c8f99, stats: { speed: 0.2, attackSpeed: 0.1 } },
  cloudBoots: { tier: 3, slot: 'boots', name: 'Cloud Boots', cost: 1900, color: 0xffffff, stats: { speed: 0.3, attackSpeed: 0.2 } },

  kiCharm: { tier: 1, slot: 'amulet', name: 'Ki Charm', cost: 300, color: 0xc98a3a, stats: { cooldown: 0.1 } },
  spiritPendant: { tier: 2, slot: 'amulet', name: 'Spirit Pendant', cost: 1000, color: 0x9fe8ff, stats: { cooldown: 0.2 } },
  dragonPearl: { tier: 3, slot: 'amulet', name: 'Dragon Pearl', cost: 2600, color: 0xff8a3d, stats: { cooldown: 0.3, damage: 0.1 } },

  scouter: { tier: 1, slot: 'accessory', name: 'Scouter Lens', cost: 600, color: 0x5be35b, stats: { range: 0.3 } },
  healingBand: { tier: 2, slot: 'accessory', name: 'Healing Band', cost: 900, color: 0xff6b8a, stats: { regen: 2, hp: 0.1 } },
  luckyCoin: { tier: 3, slot: 'accessory', name: 'Lucky Coin', cost: 1500, color: 0xffd93b, stats: { coins: 0.3 } },
};

const STAT_TEXT = {
  damage: (v) => `+${Math.round(v * 100)}% damage`,
  hp: (v) => `+${Math.round(v * 100)}% HP`,
  speed: (v) => `+${Math.round(v * 100)}% move speed`,
  attackSpeed: (v) => `+${Math.round(v * 100)}% attack speed`,
  cooldown: (v) => `abilities ${Math.round(v * 100)}% faster`,
  range: (v) => `+${Math.round(v * 100)}% attack range`,
  regen: (v) => `heals ${v + 1}x faster`,
  coins: (v) => `+${Math.round(v * 100)}% coins`,
};

export function gearText(item) {
  return Object.entries(item.stats).map(([k, v]) => STAT_TEXT[k](v)).join(', ');
}

// Adds up a hero's worn gear into one bonus object
export function gearBonus(gear = {}) {
  const b = { damage: 0, hp: 0, speed: 0, attackSpeed: 0, cooldown: 0, range: 0, regen: 0, coins: 0 };
  for (const id of Object.values(gear)) {
    const item = GEAR[id];
    if (!item) continue;
    for (const [k, v] of Object.entries(item.stats)) b[k] += v;
  }
  return b;
}

// The Lucky Spin wheel. `weight` = how likely that slice is.
// A hero you already have turns into `dupeCoins` coins.
export const SPIN = {
  cost: 300,
  dupeCoins: 400,
  slices: [
    { kind: 'hero', hero: 'zenko', label: 'Zenko', color: 0xd8442b, weight: 8 },
    { kind: 'coins', amount: 100, label: '100', color: 0x8a6a2a, weight: 26 },
    { kind: 'hero', hero: 'mira', label: 'Mira', color: 0x2fb3a0, weight: 4 },
    { kind: 'coins', amount: 200, label: '200', color: 0xa07a2a, weight: 20 },
    { kind: 'gear', label: 'Gear', color: 0x5a6a9a, weight: 14 },
    { kind: 'coins', amount: 400, label: '400', color: 0xc98a3a, weight: 10 },
    { kind: 'hero', hero: 'goran', label: 'Goran', color: 0x3f7a3a, weight: 4 },
    { kind: 'coins', amount: 50, label: '50', color: 0x6a5a3a, weight: 18 },
    { kind: 'hero', hero: 'sora', label: 'Sora', color: 0x3a6ad8, weight: 4 },
  ],
};

// Coins for a battle. bounty = the hero's Bounty skill, extra = gear bonus (0.3 = +30%).
export function battleCoins({ win, stars, levelNumber, kills, endlessWaves, bounty, extra = 0 }) {
  let c;
  if (endlessWaves !== undefined) c = endlessWaves * 12 + kills;
  // Levels pay half of what they used to (kills + win bonus)
  else c = (kills + (win ? 40 + 25 * stars + 4 * levelNumber : 15)) * 0.5;
  return Math.round(c * (bounty ? 1.25 : 1) * (1 + extra));
}
