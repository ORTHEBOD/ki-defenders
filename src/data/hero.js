// The main hero. His level, XP and learned skills are saved and never reset between levels.

export const HERO = {
  name: 'Zenko',
  look: { gi: 0xd8442b, hair: 0x2b2b3a, belt: 0x1a1a1a, skin: 0xf4c595, boots: 0x1a1a1a },
  // Level 1 stats. Every hero level adds 10% HP and 8% damage (see heroPower / heroMaxHp).
  base: { hp: 220, damage: 14, cooldown: 0.6, range: 110, speed: 170, blockRadius: 42, maxBlock: 3, respawn: 10 },
  abilities: {
    kaiWave: { name: 'Kai Wave', label: 'Kai\nWave', color: 0xff8a3d, aim: true, cooldown: 14, damage: 50, length: 420, width: 36 },
    flashStep: { name: 'Flash Step', label: 'Flash\nStep', color: 0x3fd0f5, aim: true, cooldown: 10, damage: 25, radius: 80 },
    powerUp: { name: 'Power Up', label: 'Power\nUp', color: 0xffd93b, aim: false, cooldown: 22, duration: 5 },
    spiritOrb: { name: 'Spirit Orb', label: 'Spirit\nOrb', color: 0x9fe8ff, aim: true, cooldown: 55, damage: 150, radius: 120, charge: 1 },
  },
  // Each skill costs 1 skill point. Skills in a branch are learned from top to bottom.
  skillTree: [
    {
      branch: 'Strength',
      color: 0xff6b4a,
      skills: [
        { id: 'heavyFists', name: 'Heavy Fists', desc: '+20% attack damage' },
        { id: 'critical', name: 'Critical Hit', desc: '15% chance to deal double damage' },
        { id: 'kaiWavePlus', name: 'Kai Wave+', desc: 'Kai Wave deals 60% more damage and is wider' },
        { id: 'rage', name: 'Rage', desc: '+40% damage while below half HP' },
      ],
    },
    {
      branch: 'Speed',
      color: 0x3fd0f5,
      skills: [
        { id: 'quickFeet', name: 'Quick Feet', desc: '+25% move speed' },
        { id: 'fastStrikes', name: 'Fast Strikes', desc: '+25% attack speed' },
        { id: 'flashStepPlus', name: 'Flash Step+', desc: 'Flash Step recharges 40% faster and hits twice as hard' },
        { id: 'afterimage', name: 'Afterimage', desc: 'Take 20% less damage' },
      ],
    },
    {
      branch: 'Ki mastery',
      color: 0xffd93b,
      skills: [
        { id: 'kiHarvest', name: 'Ki Harvest', desc: '+2 Ki for every enemy Zenko defeats' },
        { id: 'battleAura', name: 'Battle Aura', desc: 'Fighters near Zenko deal 15% more damage' },
        { id: 'spiritOrbPlus', name: 'Spirit Orb+', desc: 'Spirit Orb is 50% stronger, bigger and recharges faster' },
        { id: 'overflow', name: 'Overflow', desc: 'Start every level with +50 Ki' },
      ],
    },
  ],
};

export function xpToNext(level) {
  return 100 + (level - 1) * 50;
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

export function heroPower(level) {
  return 1 + 0.08 * (level - 1);
}

export function heroMaxHp(level) {
  return Math.round(HERO.base.hp * (1 + 0.1 * (level - 1)));
}
