// Daily gift, daily quests and badges (the Rewards screen). The counting is in src/systems/Rewards.js.

// The 7-day gift calendar: one gift for each day in a row. Day 7 has diamonds; after it the calendar
// starts again from day 1. A missed day starts it again too.
export const DAILY_GIFTS = [
  { coins: 100 },
  { coins: 150 },
  { coins: 200 },
  { coins: 300 },
  { coins: 400 },
  { coins: 500 },
  { coins: 500, diamonds: 5 },
];

// Daily quests: 3 a day, picked from this list. `stat` is what counts (see Rewards.track), `need` is how many.
// `when` (optional) says who can get the quest. Quests with the same `group` are never on the same day.
// fighter: a quest for one fighter the player owns ('{name}' is its name).
export const QUESTS = [
  { id: 'win3', group: 'win', stat: 'wins', need: 3, coins: 150, text: 'Win 3 battles' },
  { id: 'win5', group: 'win', stat: 'wins', need: 5, coins: 250, text: 'Win 5 battles' },
  { id: 'kill150', group: 'kill', stat: 'kills', need: 150, coins: 150, text: 'Defeat 150 monsters' },
  { id: 'kill400', group: 'kill', stat: 'kills', need: 400, coins: 300, text: 'Defeat 400 monsters' },
  { id: 'boss', stat: 'bossKills', need: 1, coins: 200, text: 'Defeat a boss' },
  { id: 'hard', stat: 'hardWins', need: 1, coins: 250, text: 'Win a level on Hard' },
  { id: 'build', group: 'build', stat: 'built', need: 12, coins: 120, text: 'Build 12 fighters' },
  { id: 'buildOne', group: 'build', fighter: true, need: 5, coins: 150, text: 'Build {name} 5 times' },
  { id: 'ability', stat: 'abilities', need: 8, coins: 150, text: 'Use hero abilities 8 times', when: 'hero' },
  { id: 'endless', stat: 'endlessWaves', need: 15, coins: 200, text: 'Clear 15 waves in Endless Battle', when: 'endless' },
  { id: 'coins', stat: 'coinsEarned', need: 600, coins: 150, text: 'Earn 600 coins in battle' },
  { id: 'spin', stat: 'spins', need: 1, coins: 100, text: 'Spin a wheel in the Shop', when: 'shop' },
];
export const QUESTS_A_DAY = 3;
// Diamonds for finishing all of today's quests
export const QUEST_BONUS = 3;

// The lucky chest after a won level: 3 closed chests, the player opens 1. A video opens one more
// (CHEST_VIDEOS a day). `weight` is how often a prize comes up; coins grow with the level number.
export const CHEST_PRIZES = [
  { coins: 60, weight: 30 },
  { coins: 120, weight: 24 },
  { coins: 250, weight: 10 },
  { xp: 150, weight: 20, hero: true },
  { diamonds: 1, weight: 12 },
  { diamonds: 3, weight: 4 },
];
export const CHEST_VIDEOS = 5;

// Badges: big goals that pay diamonds once. `stat` is a lifetime count (see Rewards.badgeStat).
export const BADGES = [
  { id: 'wins10', stat: 'wins', need: 10, diamonds: 2, name: 'Defender', text: 'Win 10 battles' },
  { id: 'wins50', stat: 'wins', need: 50, diamonds: 5, name: 'Guardian', text: 'Win 50 battles' },
  { id: 'wins200', stat: 'wins', need: 200, diamonds: 15, name: 'Legend', text: 'Win 200 battles' },
  { id: 'kills1k', stat: 'kills', need: 1000, diamonds: 3, name: 'Monster Hunter', text: 'Defeat 1,000 monsters' },
  { id: 'kills10k', stat: 'kills', need: 10000, diamonds: 10, name: 'Monster Slayer', text: 'Defeat 10,000 monsters' },
  { id: 'kills50k', stat: 'kills', need: 50000, diamonds: 25, name: 'Army Breaker', text: 'Defeat 50,000 monsters' },
  { id: 'boss5', stat: 'bossKills', need: 5, diamonds: 3, name: 'Boss Breaker', text: 'Defeat 5 bosses' },
  { id: 'boss25', stat: 'bossKills', need: 25, diamonds: 8, name: 'Boss Master', text: 'Defeat 25 bosses' },
  { id: 'hard10', stat: 'hardWins', need: 10, diamonds: 5, name: 'Tough One', text: 'Win 10 levels on Hard' },
  { id: 'perfect10', stat: 'perfect', need: 10, diamonds: 5, name: 'Flawless', text: 'Get the 4th star on 10 levels' },
  { id: 'perfect60', stat: 'perfect', need: 60, diamonds: 30, name: 'Untouchable', text: 'Get the 4th star on all 60 levels' },
  { id: 'stars30', stat: 'stars', need: 30, diamonds: 3, name: 'Rising Star', text: 'Collect 30 stars' },
  { id: 'stars90', stat: 'stars', need: 90, diamonds: 8, name: 'Shining Star', text: 'Collect 90 stars' },
  { id: 'stars180', stat: 'stars', need: 180, diamonds: 20, name: 'Superstar', text: 'Collect 180 stars' },
  { id: 'stars225', stat: 'stars', need: 225, diamonds: 30, name: 'Sky Legend', text: 'Collect all 225 stars' },
  { id: 'endless10', stat: 'endlessBest', need: 10, diamonds: 3, name: 'Survivor', text: 'Reach wave 10 in Endless Battle' },
  { id: 'endless25', stat: 'endlessBest', need: 25, diamonds: 8, name: 'Unstoppable', text: 'Reach wave 25 in Endless Battle' },
  { id: 'endless50', stat: 'endlessBest', need: 50, diamonds: 20, name: 'Endless Master', text: 'Reach wave 50 in Endless Battle' },
  { id: 'heroes2', stat: 'heroes', need: 2, diamonds: 3, name: 'Team Up', text: 'Own 2 heroes' },
  { id: 'heroes4', stat: 'heroes', need: 4, diamonds: 10, name: 'Full Team', text: 'Own all 4 heroes' },
  { id: 'built100', stat: 'built', need: 100, diamonds: 3, name: 'Builder', text: 'Build 100 fighters' },
  { id: 'built1k', stat: 'built', need: 1000, diamonds: 10, name: 'Commander', text: 'Build 1,000 fighters' },
  { id: 'ability100', stat: 'abilities', need: 100, diamonds: 3, name: 'Ki Blaster', text: 'Use hero abilities 100 times' },
  { id: 'quests30', stat: 'questsDone', need: 30, diamonds: 5, name: 'Quest Hero', text: 'Finish 30 daily quests' },
  { id: 'streak7', stat: 'streakBest', need: 7, diamonds: 5, name: 'Loyal Fighter', text: 'Visit 7 days in a row' },
];
