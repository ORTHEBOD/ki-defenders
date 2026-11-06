// All fighter (tower) data lives here: names, looks and stats.
// To rename a character or change its art later, only this file changes.
//
// Every fighter has 6 tiers: 2 per form. Moving into a new form is a TRANSFORMATION
// (new hair color, aura and a bigger power jump). tiers[0] is what you get when you build it;
// each later tier has the Ki cost to reach it.

export const FORMS = [
  { name: 'Base', hair: null, aura: null, color: '#ffffff' },
  { name: 'Super Form', hair: 0xffd93b, aura: 0xffd93b, color: '#ffd93b' },
  { name: 'Ascended Form', hair: 0x5ad8ff, aura: 0x5ad8ff, color: '#5ad8ff' },
];

export const FIGHTERS = {
  kaito: {
    name: 'Kaito',
    role: 'Brawler',
    texture: 'kaito',
    cost: 60,
    attack: 'punch',
    color: 0xffb347,
    look: { gi: 0xf47d20, hair: 0x2b2b3a, belt: 0x2f55c4, skin: 0xf4c595, boots: 0x2f55c4 },
    bonusText: 'Every 5th punch stuns the enemy',
    tiers: [
      { form: 0, damage: 12, range: 140, cooldown: 0.45 },
      { form: 0, damage: 16, range: 145, cooldown: 0.42, cost: 60 },
      { form: 1, damage: 26, range: 150, cooldown: 0.38, cost: 150 },
      { form: 1, damage: 34, range: 155, cooldown: 0.35, cost: 120 },
      { form: 2, damage: 50, range: 165, cooldown: 0.3, cost: 280, stunEvery: 5, stun: 0.6 },
      { form: 2, damage: 64, range: 170, cooldown: 0.28, cost: 200, stunEvery: 5, stun: 0.8 },
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
    bonusText: 'Huge beam, double damage to flying enemies',
    tiers: [
      { form: 0, damage: 28, range: 250, cooldown: 1.6, width: 22 },
      { form: 0, damage: 38, range: 260, cooldown: 1.5, width: 22, cost: 80 },
      { form: 1, damage: 60, range: 270, cooldown: 1.4, width: 28, cost: 180 },
      { form: 1, damage: 76, range: 280, cooldown: 1.3, width: 28, cost: 140 },
      { form: 2, damage: 110, range: 300, cooldown: 1.2, width: 36, cost: 320, flyingBonus: 2 },
      { form: 2, damage: 140, range: 310, cooldown: 1.1, width: 36, cost: 220, flyingBonus: 2 },
    ],
  },
  blaze: {
    name: 'Blaze',
    role: 'Barrage',
    texture: 'blaze',
    cost: 100,
    attack: 'blast',
    color: 0xff5a2a,
    look: { gi: 0xc0392b, hair: 0x7a1a1a, belt: 0x1a1a1a, skin: 0xf0b98a, boots: 0x1a1a1a },
    bonusText: 'Explosions leave burning ground',
    tiers: [
      { form: 0, damage: 14, range: 180, cooldown: 1.1, splash: 55 },
      { form: 0, damage: 20, range: 185, cooldown: 1.0, splash: 55, cost: 80 },
      { form: 1, damage: 32, range: 190, cooldown: 0.9, splash: 65, cost: 190 },
      { form: 1, damage: 42, range: 195, cooldown: 0.85, splash: 65, cost: 150 },
      { form: 2, damage: 60, range: 200, cooldown: 0.75, splash: 75, cost: 330, burn: { dps: 20, time: 2 } },
      { form: 2, damage: 78, range: 210, cooldown: 0.7, splash: 80, cost: 230, burn: { dps: 30, time: 2.5 } },
    ],
  },
  lumi: {
    name: 'Lumi',
    role: 'Control',
    texture: 'lumi',
    cost: 80,
    attack: 'flash',
    color: 0xfff3a8,
    look: { gi: 0xf2f2f2, hair: 0x6c3fa0, belt: 0x2aa198, skin: 0xf4c595, boots: 0x2aa198 },
    bonusText: 'The flash freezes enemies for a moment',
    // slow = enemy speed multiplier (0.5 = half speed)
    tiers: [
      { form: 0, damage: 4, range: 130, cooldown: 2.2, slow: 0.5, slowTime: 1.5 },
      { form: 0, damage: 6, range: 135, cooldown: 2.0, slow: 0.5, slowTime: 1.6, cost: 70 },
      { form: 1, damage: 8, range: 145, cooldown: 1.8, slow: 0.45, slowTime: 1.8, cost: 160 },
      { form: 1, damage: 10, range: 150, cooldown: 1.7, slow: 0.42, slowTime: 1.9, cost: 120 },
      { form: 2, damage: 14, range: 160, cooldown: 1.6, slow: 0.4, slowTime: 2, cost: 280, freeze: 0.6 },
      { form: 2, damage: 18, range: 170, cooldown: 1.5, slow: 0.35, slowTime: 2.2, cost: 200, freeze: 0.8 },
    ],
  },
  oru: {
    name: 'Master Oru',
    role: 'Support',
    texture: 'oru',
    cost: 120,
    attack: 'support',
    color: 0x9bff7a,
    look: { gi: 0x8a5a2b, hair: 0xf0f0f0, belt: 0xc0392b, skin: 0xe8c09a, boots: 0x3a2a1a },
    bonusText: 'Aura also makes nearby fighters attack faster',
    // boost = extra damage for fighters in range; makes `ki` every `kiEvery` seconds during a wave
    tiers: [
      { form: 0, boost: 0.15, range: 150, ki: 3, kiEvery: 4 },
      { form: 0, boost: 0.2, range: 155, ki: 4, kiEvery: 4, cost: 100 },
      { form: 1, boost: 0.3, range: 165, ki: 6, kiEvery: 4, cost: 220 },
      { form: 1, boost: 0.35, range: 170, ki: 8, kiEvery: 4, cost: 160 },
      { form: 2, boost: 0.45, range: 180, ki: 10, kiEvery: 4, cost: 380, haste: 0.15 },
      { form: 2, boost: 0.5, range: 190, ki: 12, kiEvery: 4, cost: 260, haste: 0.2 },
    ],
  },
};

// Maze levels only: a cheap block that does not attack. It just makes enemies walk around it.
export const WALL = { name: 'Ki Wall', role: 'Blocks path', cost: 8, texture: 'wall', color: 0x9aa3c7 };
