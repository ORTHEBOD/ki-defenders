// speed is in pixels per second; lives = how many lives you lose if it reaches the base;
// dps = damage per second it deals to Zenko while he blocks it.

export const ENEMIES = {
  grunt: { name: 'Grunt', texture: 'grunt', hp: 60, speed: 55, reward: 8, lives: 1, dps: 10, barOffset: 30 },
  runner: { name: 'Runner', texture: 'runner', hp: 30, speed: 110, reward: 6, lives: 1, dps: 6, barOffset: 24 },
};
