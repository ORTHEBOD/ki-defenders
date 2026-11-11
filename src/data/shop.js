// Everything the shop sells. Coins are won in every battle.

// Equipment: each hero can wear one item per slot. Bought items can be worn by any hero.
// stats: damage / hp / speed / attackSpeed / range / coins = +%, cooldown = -% ability recharge time,
// regen = extra healing speed (2 = heals 3x faster).
// tier: 1 = Common, 2 = Rare, 3 = Epic, 4 = Legendary, 5 = Mythic, 6 = Divine.
// A tier is sold once a hero is strong enough (hero level 5, 10, 15, 20, 25, 30: see Progress.js).
// show (accessories only): how it looks on the hero - scouter, band or coin.
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
  titanFists: { tier: 4, slot: 'weapon', name: 'Titan Fists', cost: 4500, color: 0xff8a3d, stats: { damage: 0.5 } },
  thunderGauntlets: { tier: 5, slot: 'weapon', name: 'Thunder Gauntlets', cost: 8000, color: 0x7fd8ff, stats: { damage: 0.65, attackSpeed: 0.1 } },
  godFists: { tier: 6, slot: 'weapon', name: 'God Fists', cost: 13000, color: 0xfff2a8, stats: { damage: 0.85, attackSpeed: 0.15 } },

  clothVest: { tier: 1, slot: 'armor', name: 'Cloth Vest', cost: 250, color: 0xc98a3a, stats: { hp: 0.15 } },
  battleArmor: { tier: 2, slot: 'armor', name: 'Battle Armor', cost: 800, color: 0x8c8f99, stats: { hp: 0.3 } },
  divineArmor: { tier: 3, slot: 'armor', name: 'Divine Armor', cost: 2200, color: 0x5ad8ff, stats: { hp: 0.5, damage: 0.05 } },
  titanPlate: { tier: 4, slot: 'armor', name: 'Titan Plate', cost: 4500, color: 0xd9772b, stats: { hp: 0.7, damage: 0.05 } },
  phoenixArmor: { tier: 5, slot: 'armor', name: 'Phoenix Armor', cost: 8000, color: 0xff4b3d, stats: { hp: 0.9, damage: 0.08, regen: 1 } },
  celestialArmor: { tier: 6, slot: 'armor', name: 'Celestial Armor', cost: 13000, color: 0xe8f4ff, stats: { hp: 1.2, damage: 0.12 } },

  trainingPants: { tier: 1, slot: 'pants', name: 'Training Pants', cost: 220, color: 0x3a6ad8, stats: { hp: 0.08, speed: 0.05 } },
  weightedPants: { tier: 2, slot: 'pants', name: 'Weighted Pants', cost: 750, color: 0x6a4a9a, stats: { hp: 0.15, speed: 0.1 } },
  dragonPants: { tier: 3, slot: 'pants', name: 'Dragon Gi Pants', cost: 2000, color: 0xe0661a, stats: { hp: 0.25, speed: 0.15, damage: 0.05 } },
  titanLeggings: { tier: 4, slot: 'pants', name: 'Titan Leggings', cost: 4000, color: 0x8a5a2a, stats: { hp: 0.35, speed: 0.18, damage: 0.06 } },
  stormPants: { tier: 5, slot: 'pants', name: 'Storm Pants', cost: 7200, color: 0x2a8ad8, stats: { hp: 0.45, speed: 0.22, damage: 0.08 } },
  celestialPants: { tier: 6, slot: 'pants', name: 'Celestial Gi Pants', cost: 12000, color: 0xf2f4f8, stats: { hp: 0.6, speed: 0.25, damage: 0.12 } },

  sandals: { tier: 1, slot: 'boots', name: 'Swift Sandals', cost: 200, color: 0xc98a3a, stats: { speed: 0.12 } },
  windBoots: { tier: 2, slot: 'boots', name: 'Wind Boots', cost: 700, color: 0x8c8f99, stats: { speed: 0.2, attackSpeed: 0.1 } },
  cloudBoots: { tier: 3, slot: 'boots', name: 'Cloud Boots', cost: 1900, color: 0xffffff, stats: { speed: 0.3, attackSpeed: 0.2 } },
  thunderBoots: { tier: 4, slot: 'boots', name: 'Thunder Boots', cost: 3800, color: 0xffd93b, stats: { speed: 0.36, attackSpeed: 0.28 } },
  phoenixBoots: { tier: 5, slot: 'boots', name: 'Phoenix Boots', cost: 7000, color: 0xff5a3d, stats: { speed: 0.42, attackSpeed: 0.36 } },
  lightBoots: { tier: 6, slot: 'boots', name: 'Light Speed Boots', cost: 11500, color: 0x9ffff0, stats: { speed: 0.5, attackSpeed: 0.45 } },

  kiCharm: { tier: 1, slot: 'amulet', name: 'Ki Charm', cost: 300, color: 0xc98a3a, stats: { cooldown: 0.1 } },
  spiritPendant: { tier: 2, slot: 'amulet', name: 'Spirit Pendant', cost: 1000, color: 0x9fe8ff, stats: { cooldown: 0.2 } },
  dragonPearl: { tier: 3, slot: 'amulet', name: 'Dragon Pearl', cost: 2600, color: 0xff8a3d, stats: { cooldown: 0.3, damage: 0.1 } },
  titanSeal: { tier: 4, slot: 'amulet', name: 'Titan Seal', cost: 5000, color: 0xffb347, stats: { cooldown: 0.35, damage: 0.15 } },
  phoenixHeart: { tier: 5, slot: 'amulet', name: 'Phoenix Heart', cost: 9000, color: 0xff3b5a, stats: { cooldown: 0.4, damage: 0.2, hp: 0.1 } },
  godStar: { tier: 6, slot: 'amulet', name: 'Star of the Gods', cost: 14000, color: 0xbff8ff, stats: { cooldown: 0.45, damage: 0.3 } },

  scouter: { tier: 1, slot: 'accessory', show: 'scouter', name: 'Scouter Lens', cost: 600, color: 0x5be35b, stats: { range: 0.3 } },
  healingBand: { tier: 2, slot: 'accessory', show: 'band', name: 'Healing Band', cost: 900, color: 0xff6b8a, stats: { regen: 2, hp: 0.1 } },
  luckyCoin: { tier: 3, slot: 'accessory', show: 'coin', name: 'Lucky Coin', cost: 1500, color: 0xffd93b, stats: { coins: 0.3 } },
  eagleScouter: { tier: 4, slot: 'accessory', show: 'scouter', name: 'Eagle Scouter', cost: 4000, color: 0xff8a3d, stats: { range: 0.45, damage: 0.1 } },
  phoenixBand: { tier: 5, slot: 'accessory', show: 'band', name: 'Phoenix Band', cost: 7000, color: 0xff4b3d, stats: { regen: 4, hp: 0.3 } },
  dragonCoin: { tier: 6, slot: 'accessory', show: 'coin', name: 'Golden Dragon Coin', cost: 11000, color: 0xfff2a8, stats: { coins: 0.6, damage: 0.1 } },
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

// The 6 gear tiers: name, and the color of the shop card and its label
export const RARITY = [
  { name: 'Common', color: 0x8c96b0, text: '#c9d3ff' },
  { name: 'Rare', color: 0x3fa8ff, text: '#7ac8ff' },
  { name: 'Epic', color: 0xc86bff, text: '#e0a8ff' },
  { name: 'Legendary', color: 0xffa53b, text: '#ffc27a' },
  { name: 'Mythic', color: 0xff4b6a, text: '#ff8a9f' },
  { name: 'Divine', color: 0x5affe0, text: '#a8fff0' },
];

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
