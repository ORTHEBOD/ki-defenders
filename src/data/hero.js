// The main hero. His level and XP are saved and never reset between levels.

export const HERO = {
  name: 'Zenko',
  look: { gi: 0xd8442b, hair: 0x2b2b3a, belt: 0x1a1a1a, skin: 0xf4c595, boots: 0x1a1a1a },
  skillTree: [
    { branch: 'Strength', color: 0xff6b4a, skills: ['Heavy Fists', 'Critical Hit', 'Kai Wave+', 'Rage'] },
    { branch: 'Speed', color: 0x3fd0f5, skills: ['Quick Feet', 'Fast Strikes', 'Flash Step+', 'Afterimage'] },
    { branch: 'Ki mastery', color: 0xffd93b, skills: ['Ki Harvest', 'Battle Aura', 'Spirit Orb+', 'Overflow'] },
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

export function skillPoints(hero) {
  return hero.level - 1;
}
