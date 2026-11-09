// The heroes. Each hero's level, XP, skills and gear are saved and never reset between levels.
// Zenko is the starting hero; the others are won in the Lucky Spin (shop).
// All heroes share the same 4 ability buttons and skill tree, but have their own stats,
// and `mods` make some abilities stronger (damage x, cooldown x, duration x).

export const HEROES = {
  zenko: {
    name: 'Zenko',
    title: 'Balanced fighter',
    look: { gi: 0xd8442b, hair: 0x2b2b3a, belt: 0x1a1a1a, skin: 0xf4c595, boots: 0x1a1a1a },
    base: { hp: 220, damage: 14, cooldown: 0.6, range: 110, speed: 170, blockRadius: 42, maxBlock: 3, respawn: 10 },
    mods: {},
  },
  mira: {
    name: 'Mira',
    title: 'Lightning-fast striker',
    look: { gi: 0x2fb3a0, hair: 0xff6fb0, belt: 0x1a3a5a, skin: 0xf9d2b0, boots: 0x1a3a5a },
    base: { hp: 180, damage: 10, cooldown: 0.38, range: 120, speed: 235, blockRadius: 42, maxBlock: 2, respawn: 8 },
    mods: { flashStep: { cooldown: 0.65, damage: 1.4 } },
    perk: 'Very fast attacks. Flash Step is stronger and recharges faster.',
  },
  goran: {
    name: 'Goran',
    title: 'Unbreakable tank',
    look: { gi: 0x3f7a3a, hair: 0x6b3a1a, belt: 0xd8a02b, skin: 0xd9a27a, boots: 0x3a2a1a },
    base: { hp: 400, damage: 13, cooldown: 0.75, range: 100, speed: 140, blockRadius: 52, maxBlock: 5, respawn: 12 },
    mods: { powerUp: { duration: 1.6 } },
    perk: 'Huge HP and blocks up to 5 enemies. Power Up lasts longer.',
  },
  sora: {
    name: 'Sora',
    title: 'Ki master',
    look: { gi: 0xeef2f8, hair: 0x3a6ad8, belt: 0x6a3ab8, skin: 0xf4c595, boots: 0x6a3ab8 },
    base: { hp: 170, damage: 16, cooldown: 0.7, range: 175, speed: 160, blockRadius: 40, maxBlock: 2, respawn: 10 },
    mods: { kaiWave: { damage: 1.35 }, spiritOrb: { damage: 1.3, cooldown: 0.8 } },
    perk: 'Long range. Kai Wave and Spirit Orb hit much harder.',
  },
};

export const ABILITIES = {
  kaiWave: { name: 'Kai Wave', label: 'Kai\nWave', color: 0xff8a3d, aim: true, cooldown: 14, damage: 50, length: 420, width: 36 },
  flashStep: { name: 'Flash Step', label: 'Flash\nStep', color: 0x3fd0f5, aim: true, cooldown: 10, damage: 25, radius: 80 },
  powerUp: { name: 'Power Up', label: 'Power\nUp', color: 0xffd93b, aim: false, cooldown: 22, duration: 5 },
  spiritOrb: { name: 'Spirit Orb', label: 'Spirit\nOrb', color: 0x9fe8ff, aim: true, cooldown: 55, damage: 150, radius: 120, charge: 1 },
};

// Kai Wave can be used from the start; the other abilities are learned in the Techniques branch.
export const FREE_ABILITY = 'kaiWave';

// Each skill costs 1 skill point. Skills in a branch are learned from top to bottom.
// `needs` = another skill that must be learned first (from any branch).
// `level` = the hero level needed to learn it (the Forms branch: a new form every 5 levels).
export const SKILL_TREE = [
  {
    branch: 'Forms',
    color: 0xffd93b,
    skills: [
      { id: 'superForm', name: 'Super Form', desc: 'Gold hair: +12% damage and +10% HP for good. Power Up goes one form higher', level: 5, form: 1 },
      { id: 'superForm2', name: 'Super Form 2', desc: 'Gold hair with lightning: another +12% damage and +10% HP', level: 10, form: 2 },
      { id: 'superForm3', name: 'Super Form 3', desc: 'Long gold hair: another +12% damage and +10% HP', level: 15, form: 3 },
      { id: 'divineForm', name: 'Divine Form', desc: 'Red hair: another +12% damage and +10% HP', level: 20, form: 4 },
      { id: 'ascendedForm', name: 'Ascended Form', desc: 'Blue hair, the top form: another +12% damage and +10% HP', level: 25, form: 5 },
    ],
  },
  {
    branch: 'Techniques',
    color: 0xc38be0,
    skills: [
      { id: 'flashStep', name: 'Flash Step', desc: 'New ability: teleport and blast the enemies around you', ability: true },
      { id: 'powerUp', name: 'Power Up', desc: 'New ability: gold hair for a few seconds - stronger and faster', ability: true },
      { id: 'spiritOrb', name: 'Spirit Orb', desc: 'New ability: charge a giant orb and throw it for a huge explosion', ability: true },
    ],
  },
  {
    branch: 'Strength',
    color: 0xff6b4a,
    skills: [
      { id: 'heavyFists', name: 'Heavy Fists', desc: '+20% attack damage' },
      { id: 'critical', name: 'Critical Hit', desc: '15% chance to deal double damage' },
      { id: 'kaiWavePlus', name: 'Kai Wave+', desc: 'Kai Wave deals 60% more damage and is wider' },
      { id: 'rage', name: 'Rage', desc: '+40% damage while below half HP' },
      { id: 'chainHit', name: 'Chain Hit', desc: 'Attacks also hit 1 more enemy nearby for half damage' },
      { id: 'bossSlayer', name: 'Boss Slayer', desc: '+40% damage to bosses' },
    ],
  },
  {
    branch: 'Speed',
    color: 0x3fd0f5,
    skills: [
      { id: 'quickFeet', name: 'Quick Feet', desc: '+25% move speed' },
      { id: 'fastStrikes', name: 'Fast Strikes', desc: '+25% attack speed' },
      { id: 'flashStepPlus', name: 'Flash Step+', desc: 'Flash Step recharges 40% faster and hits twice as hard', needs: 'flashStep' },
      { id: 'afterimage', name: 'Afterimage', desc: 'Take 20% less damage' },
      { id: 'quickReturn', name: 'Quick Return', desc: 'Come back twice as fast after being defeated' },
      { id: 'cooldownMaster', name: 'Focus', desc: 'All abilities recharge 20% faster' },
    ],
  },
  {
    branch: 'Ki mastery',
    color: 0xffd93b,
    skills: [
      { id: 'kiHarvest', name: 'Ki Harvest', desc: '+2 Ki for every enemy the hero defeats' },
      { id: 'battleAura', name: 'Battle Aura', desc: 'Fighters near the hero deal 15% more damage' },
      { id: 'spiritOrbPlus', name: 'Spirit Orb+', desc: 'Spirit Orb is 50% stronger, bigger and recharges faster', needs: 'spiritOrb' },
      { id: 'overflow', name: 'Overflow', desc: 'Start every level with +50 Ki' },
      { id: 'bounty', name: 'Bounty', desc: '+25% coins from every battle' },
      { id: 'greatAura', name: 'Great Aura', desc: 'Battle Aura reaches farther and gives +25% damage' },
    ],
  },
];

// Kept for older code: the starting hero
export const HERO = { ...HEROES.zenko, abilities: ABILITIES, skillTree: SKILL_TREE };

// Can this saved hero use this ability yet?
export function hasAbility(hero, key) {
  return key === FREE_ABILITY || learnedSkills(hero).includes(key);
}

export function newHeroSave() {
  return { level: 1, xp: 0, skills: [], gear: {} };
}

export function xpToNext(level) {
  return 120 + (level - 1) * 80;
}

// Adds XP to a saved hero ({ level, xp }) and returns how many levels were gained
export function addXp(hero, amount) {
  let gained = 0;
  hero.xp += amount;
  while (hero.xp >= xpToNext(hero.level)) {
    hero.xp -= xpToNext(hero.level);
    hero.level++;
    gained++;
  }
  return gained;
}

export function learnedSkills(hero) {
  return hero.skills ?? [];
}

export function skillPoints(hero) {
  return hero.level - 1 - learnedSkills(hero).length;
}

// The hero's form: how many skills of the Forms branch are learned (0 = Base ... 5 = Ascended)
export function heroForm(hero) {
  const forms = SKILL_TREE[0].skills;
  return forms.filter((s) => learnedSkills(hero).includes(s.id)).length;
}

// Each form makes the hero stronger
export const formDamage = (form) => 1 + 0.12 * form;
export const formHp = (form) => 1 + 0.1 * form;

export function heroPower(level) {
  return 1 + 0.08 * (level - 1);
}

export function heroMaxHp(level, base = HEROES.zenko.base.hp) {
  return Math.round(base * (1 + 0.1 * (level - 1)));
}
