// All fighter (tower) data lives here: names, looks and stats.
// To rename a character or change its art later, only this file changes.
//
// Every fighter has 18 steps: each of the 6 forms, then 2 normal upgrades (+1, +2) before the next form.
// Moving into a new form is a TRANSFORMATION (new hair, aura and a bigger power jump).
// Fighters earn EXP by hurting enemies (shared by damage); a step can only be bought (with Ki) once its EXP is reached.

export const FORMS = [
  { name: 'Base', hair: null, aura: null, color: '#ffffff' },
  { name: 'Super Form', hair: 0xffd93b, aura: 0xffd93b, color: '#ffd93b' },
  { name: 'Super Form 2', hair: 0xffe14d, aura: 0xffe680, color: '#ffe680', sparks: true },
  { name: 'Super Form 3', hair: 0xffd23b, aura: 0xffc83b, color: '#ffc83b', sparks: true, longHair: true },
  { name: 'Divine Form', hair: 0xe0303a, aura: 0xff4b5a, color: '#ff6b78' },
  { name: 'Ascended Form', hair: 0x5ad8ff, aura: 0x5ad8ff, color: '#5ad8ff' },
];

// Forms open as the story goes on: a fighter can reach form i (and its +1, +2) once level
// FORM_LEVELS[i] has been beaten. Base is always open.
export const FORM_LEVELS = [0, 3, 8, 13, 18, 25];

// The form bonus (stun, burn, freeze...) switches on at this form
export const BONUS_FORM = 4;

// For each step: power (damage, Ki made...) compared to the base step, and Ki cost compared to the
// fighter's build cost. Steps 3, 6, 9, 12 and 15 are the transformations.
const POWER = [1, 1.15, 1.3, 1.8, 2, 2.2, 2.8, 3.05, 3.3, 4, 4.3, 4.6, 5.5, 5.9, 6.3, 7.4, 7.9, 8.4];
const COST = [0, 0.8, 1, 2, 1.4, 1.6, 3, 2, 2.2, 4, 2.6, 2.8, 5, 3.2, 3.4, 6.5, 4, 4.4];
// EXP a fighter needs for each step (added up as it goes). Big enemies and bosses give more EXP.
const EXP = [0, 3, 4, 6, 6, 8, 11, 10, 11, 16, 13, 14, 20, 16, 18, 27, 21, 24];
export const EXP_TOTAL = EXP.reduce((list, n, i) => [...list, (list[i - 1] ?? 0) + n], []);

// Builds the 18 steps from the base stats. `grow(t, form)` adds the stats that change on their own
// (t goes from 0 at the first step to 1 at the last).
function steps(cost, base, grow) {
  const last = POWER.length - 1;
  return POWER.map((power, i) => {
    const form = Math.floor(i / 3);
    const step = { form, power, ...grow(i / last, form, power) };
    if (i > 0) step.cost = Math.round((cost * COST[i]) / 5) * 5;
    if (base.damage) step.damage = Math.round(base.damage * power);
    return step;
  });
}

const r = (n, d = 2) => Number(n.toFixed(d));

export const FIGHTERS = {
  kaito: {
    name: 'Kaito',
    unlock: 1,
    role: 'Brawler',
    texture: 'kaito',
    cost: 60,
    attack: 'punch',
    hitsAir: false,
    color: 0xffb347,
    look: { gi: 0xf47d20, hair: 0x2b2b3a, belt: 0x2f55c4, skin: 0xf4c595, boots: 0x2f55c4 },
    bonusText: 'Every 5th punch stuns the enemy',
    tiers: steps(60, { damage: 12 }, (t, form) => ({
      range: Math.round(140 + 35 * t), cooldown: r(0.45 * (1 - 0.4 * t)),
      ...(form >= BONUS_FORM && { stunEvery: 5, stun: form === 5 ? 0.8 : 0.6 }),
    })),
  },
  ronin: {
    name: 'Ronin',
    unlock: 1,
    role: 'Beam sniper',
    texture: 'ronin',
    cost: 90,
    attack: 'beam',
    hitsAir: true,
    color: 0x3fd0f5,
    look: { gi: 0x2f3f8f, hair: 0xd8dde8, belt: 0xc0392b, skin: 0xe8b98a, boots: 0x1a1a1a },
    bonusText: 'Huge beam, double damage to flying enemies',
    tiers: steps(90, { damage: 28 }, (t, form) => ({
      range: Math.round(250 + 65 * t), cooldown: r(1.6 * (1 - 0.32 * t)), width: Math.round(22 + 16 * t),
      ...(form >= BONUS_FORM && { flyingBonus: 2 }),
    })),
  },
  blaze: {
    name: 'Blaze',
    unlock: 5,
    role: 'Barrage',
    texture: 'blaze',
    cost: 100,
    attack: 'blast',
    hitsAir: true,
    color: 0xff5a2a,
    look: { gi: 0xc0392b, hair: 0x7a1a1a, belt: 0x1a1a1a, skin: 0xf0b98a, boots: 0x1a1a1a },
    bonusText: 'Explosions leave burning ground',
    tiers: steps(100, { damage: 14 }, (t, form) => ({
      range: Math.round(180 + 32 * t), cooldown: r(1.1 * (1 - 0.38 * t)), splash: Math.round(55 + 28 * t),
      ...(form >= BONUS_FORM && { burn: form === 5 ? { dps: 30, time: 2.5 } : { dps: 20, time: 2 } }),
    })),
  },
  lumi: {
    name: 'Lumi',
    unlock: 3,
    role: 'Control',
    texture: 'lumi',
    cost: 80,
    attack: 'flash',
    hitsAir: false,
    color: 0xfff3a8,
    look: { gi: 0xf2f2f2, hair: 0x6c3fa0, belt: 0x2aa198, skin: 0xf4c595, boots: 0x2aa198 },
    bonusText: 'The flash freezes enemies for a moment',
    // slow = enemy speed multiplier (0.5 = half speed)
    tiers: steps(80, { damage: 4 }, (t, form) => ({
      range: Math.round(130 + 42 * t), cooldown: r(2.2 * (1 - 0.33 * t)), slow: r(0.5 - 0.17 * t), slowTime: r(1.5 + 0.8 * t, 1),
      ...(form >= BONUS_FORM && { freeze: form === 5 ? 0.8 : 0.6 }),
    })),
  },
  oru: {
    name: 'Master Oru',
    unlock: 8,
    role: 'Support',
    texture: 'oru',
    cost: 120,
    attack: 'support',
    color: 0x9bff7a,
    look: { gi: 0x8a5a2b, hair: 0xf0f0f0, belt: 0xc0392b, skin: 0xe8c09a, boots: 0x3a2a1a },
    bonusText: 'Aura also makes nearby fighters attack faster',
    // boost = extra damage for fighters in range; makes `ki` every `kiEvery` seconds during a wave
    tiers: steps(120, {}, (t, form, power) => ({
      boost: r(0.15 + 0.4 * t), range: Math.round(150 + 42 * t), ki: Math.round(3 * (1 + (power - 1) * 0.45)), kiEvery: 4,
      ...(form >= BONUS_FORM && { haste: form === 5 ? 0.2 : 0.15 }),
    })),
  },
};

// Fighters the player can build on a level (all of them in Endless)
export function fightersFor(levelId, endless) {
  return Object.keys(FIGHTERS).filter((type) => endless || levelId >= FIGHTERS[type].unlock);
}

// Maze levels only: a cheap block that does not attack. It just makes enemies walk around it.
export const WALL = { name: 'Ki Wall', role: 'Blocks path', cost: 8, texture: 'wall', color: 0x9aa3c7 };
