// Player titles (shown next to the name in the Hub and on the weekly leaderboard) and the frames
// for the top places on the leaderboard.

// A title from the best weekly leaderboard place ever won (p.prizes), else from the player's progress.
// The first one that fits wins.
export const TITLES = [
  { name: '👑 Champion', color: '#ffd93b', fits: (p, s) => s.bestPlace === 1 },
  { name: '🏆 Grand Master', color: '#e0e6ff', fits: (p, s) => s.bestPlace <= 3 },
  { name: '⭐ Elite', color: '#7fe3ff', fits: (p, s) => s.bestPlace <= 10 },
  { name: 'Ki Legend', color: '#ff8af0', fits: (p, s) => s.stars >= 180 && s.perfect >= 60 },
  { name: 'Hard Hero', color: '#ff7a7a', fits: (p, s) => s.perfect >= 20 },
  { name: 'Veteran', color: '#ffb36b', fits: (p, s) => s.stars >= 90 },
  { name: 'Defender', color: '#9fe8a0', fits: (p, s) => s.stars >= 30 },
  { name: 'Rookie', color: '#c9d3ff', fits: () => true },
];

// Frames around the top rows of the weekly leaderboard: [last place, frame color, title this week]
export const RANK_FRAMES = [
  [1, 0xffd93b, '👑 Champion'],
  [3, 0xd4d8e6, '🏆 Master'],
  [10, 0x3fd0f5, '⭐ Elite'],
];
