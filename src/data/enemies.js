// speed is in pixels per second; lives = how many lives you lose if it reaches the base;
// dps = damage per second it deals to Zenko while he blocks it.
// armor: every hit does `armor` less damage (but always at least 30%), so small hits hurt it less.
// flying: goes straight over maze walls, Zenko can't block it, and only fighters with hitsAir can hit it.
// tip: shown the first time this enemy shows up in a level.
// xp: hero XP for defeating it (double if the hero lands the final blow).

export const ENEMIES = {
  grunt: { name: 'Grunt', xp: 1, texture: 'grunt', hp: 60, speed: 55, reward: 8, lives: 1, dps: 10, barOffset: 30 },
  runner: { name: 'Runner', xp: 1, texture: 'runner', hp: 30, speed: 110, reward: 6, lives: 1, dps: 6, barOffset: 24 },
  brute: {
    name: 'Brute', xp: 3, texture: 'brute', hp: 200, speed: 34, reward: 18, lives: 2, dps: 24, barOffset: 40, armor: 4,
    tip: 'Brute: slow and armored. Small hits barely hurt it - use strong attacks!',
  },
  flyer: {
    name: 'Flyer', xp: 2, texture: 'flyer', hp: 50, speed: 70, reward: 10, lives: 1, dps: 0, barOffset: 52, flying: true,
    tip: 'Flyer: flies over walls. Kaito and Lumi can\'t reach it - use Ronin, Blaze or Zenko!',
  },
  splitter: {
    name: 'Splitter', xp: 2, texture: 'splitter', hp: 110, speed: 48, reward: 6, lives: 1, dps: 12, barOffset: 30,
    splitInto: { type: 'splitling', count: 2 },
    tip: 'Splitter: breaks into 2 small ones when defeated.',
  },
  splitling: { name: 'Splitling', xp: 1, texture: 'splitling', hp: 35, speed: 78, reward: 3, lives: 1, dps: 5, barOffset: 20 },
  medic: {
    name: 'Medic', xp: 2, texture: 'medic', hp: 90, speed: 50, reward: 12, lives: 1, dps: 6, barOffset: 34,
    heal: { amount: 0.1, radius: 100, every: 2.5 },
    tip: 'Medic: heals the enemies around it. Take it down first!',
  },

  // ---------- Bosses ----------
  // skills run on a timer (every N seconds). hardSkills are added on Hard difficulty.
  //   stomp:  stuns fighters (and hurts Zenko) around the boss
  //   stun:   blasts one fighter in range and stuns it
  //   shield: a bubble that soaks up damage (amount = part of max HP) for `time` seconds
  //   summon: calls more enemies next to the boss
  //   enrage: once below half HP, it moves faster (no timer)
  ogre: {
    name: 'Ogre Captain', xp: 15, texture: 'ogre', hp: 750, speed: 26, reward: 80, lives: 5, dps: 40, barOffset: 56,
    armor: 5, boss: true,
    skills: { stomp: { every: 9, radius: 140, stun: 2, damage: 30 } },
    hardSkills: { enrage: { speed: 1.6 } },
  },
  krag: {
    name: 'General Krag', xp: 40, texture: 'krag', hp: 2000, speed: 22, reward: 200, lives: 10, dps: 60, barOffset: 70,
    armor: 5, boss: true,
    skills: {
      shield: { every: 15, amount: 0.15, time: 5 },
      summon: { every: 11, type: 'grunt', count: 3, hpScale: 1.5 },
      stun: { every: 8, range: 260, time: 3 },
    },
    hardSkills: { stomp: { every: 10, radius: 150, stun: 2, damage: 40 } },
  },
  scorpion: {
    name: 'Scorpion King', xp: 20, texture: 'scorpion', hp: 1000, speed: 30, reward: 90, lives: 5, dps: 45, barOffset: 50,
    armor: 6, boss: true,
    skills: { stun: { every: 7, range: 220, time: 2 } },
    hardSkills: { enrage: { speed: 1.6 } },
  },
  sandKing: {
    name: 'Sand King Ozul', xp: 60, texture: 'sandKing', hp: 3200, speed: 20, reward: 260, lives: 10, dps: 70, barOffset: 74,
    armor: 7, boss: true,
    skills: {
      summon: { every: 12, type: 'splitter', count: 2, hpScale: 2 },
      shield: { every: 16, amount: 0.15, time: 5 },
      stomp: { every: 10, radius: 150, stun: 2, damage: 40 },
    },
    hardSkills: { enrage: { speed: 1.5 } },
  },
  mech: {
    name: 'War Mech', xp: 25, texture: 'mech', hp: 1300, speed: 28, reward: 110, lives: 5, dps: 55, barOffset: 54,
    armor: 8, boss: true,
    skills: { shield: { every: 12, amount: 0.2, time: 4 } },
    hardSkills: { stun: { every: 8, range: 240, time: 2 } },
  },
  vorn: {
    name: 'Emperor Vorn', xp: 100, texture: 'vorn', hp: 4800, speed: 20, reward: 400, lives: 20, dps: 90, barOffset: 78,
    armor: 8, boss: true,
    skills: {
      summon: { every: 10, type: 'flyer', count: 3, hpScale: 3 },
      stun: { every: 6, range: 280, time: 2.5 },
      shield: { every: 14, amount: 0.12, time: 5 },
      stomp: { every: 9, radius: 160, stun: 2, damage: 60 },
    },
    hardSkills: { enrage: { speed: 1.5 } },
  },
};
