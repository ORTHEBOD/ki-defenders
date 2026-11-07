// hp multiplies every enemy's health; ki multiplies the starting Ki;
// stars is the reward for winning on that difficulty.

export const DIFFICULTY = {
  easy: { label: 'Easy', hp: 0.75, ki: 1, stars: 1, color: 0x2f8a4a },
  normal: { label: 'Normal', hp: 1, ki: 1, stars: 2, color: 0xe0661a },
  hard: { label: 'Hard', hp: 1.5, ki: 1.15, stars: 3, color: 0xb8303a },
};
