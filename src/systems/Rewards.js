import { DAILY_GIFTS, QUESTS, QUESTS_A_DAY, QUEST_BONUS, BADGES } from '../data/rewards.js';
import { FIGHTERS } from '../data/fighters.js';
import { totalStars } from './Save.js';
import { shopOpen, endlessOpen } from './Progress.js';

// The daily gift, today's quests and the badges, worked out from the player's save:
//   p.daily  { last: '2026-11-19', streak: days in a row }
//   p.quests { day, list: [{ id, stat, need, coins, text, have, claimed }], bonus: claimed }
//   p.totals lifetime counts (wins, bossKills, built, ...) for the badges
//   p.badges ids of the badges already claimed
// Every function here changes `p` in place: call them inside Save.update.

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// Which calendar day (0-6) a streak is on
export const giftDay = (streak) => (Math.max(1, streak) - 1) % DAILY_GIFTS.length;

// Gives today's gift if it was not given yet. Returns { streak, day, gift } or null.
export function claimDaily(p) {
  const today = dayKey();
  if (p.daily.last === today) return null;
  const streak = p.daily.last === dayKey(new Date(Date.now() - 86400000)) ? p.daily.streak + 1 : 1;
  const day = giftDay(streak);
  const gift = DAILY_GIFTS[day];
  p.daily = { last: today, streak };
  p.coins += gift.coins ?? 0;
  p.diamonds += gift.diamonds ?? 0;
  p.totals.streakBest = Math.max(p.totals.streakBest ?? 0, streak);
  return { streak, day, gift };
}

// A number from a text, so a player gets the same quests all day
function seed(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// Today's quests, picked the first time they are needed each day
export function todayQuests(p) {
  const today = dayKey();
  if (p.quests?.day === today) return p.quests;
  const ok = (q) => !q.when || (q.when === 'hero' && p.activeHero) || (q.when === 'shop' && shopOpen(p))
    || (q.when === 'endless' && endlessOpen(p));
  const rand = seed(`${today}:${p.name}`);
  const pool = QUESTS.filter(ok);
  const list = [];
  const groups = new Set();
  while (list.length < QUESTS_A_DAY && pool.length) {
    const q = pool.splice(Math.floor(rand() * pool.length), 1)[0];
    if (q.group && groups.has(q.group)) continue;
    if (q.group) groups.add(q.group);
    let quest = { id: q.id, stat: q.stat, need: q.need, coins: q.coins, text: q.text };
    if (q.fighter) {
      const owned = (p.fighters ?? []).filter((t) => FIGHTERS[t]);
      if (!owned.length) continue;
      const type = owned[Math.floor(rand() * owned.length)];
      quest = { ...quest, stat: `built_${type}`, text: q.text.replace('{name}', FIGHTERS[type].name) };
    }
    list.push({ ...quest, have: 0, claimed: false });
  }
  p.quests = { day: today, list, bonus: false };
  return p.quests;
}

// Counts what the player did: { wins: 1, kills: 120, built_kaito: 3, ... } (today's quests and the badges)
export function track(p, counts) {
  const quests = todayQuests(p);
  for (const [stat, n] of Object.entries(counts)) {
    if (!n) continue;
    p.totals[stat] = (p.totals[stat] ?? 0) + n;
    for (const q of quests.list) if (q.stat === stat) q.have = Math.min(q.need, q.have + n);
  }
}

// Pays a finished quest. Returns the coins, or 0.
export function claimQuest(p, index) {
  const q = todayQuests(p).list[index];
  if (!q || q.claimed || q.have < q.need) return 0;
  q.claimed = true;
  p.coins += q.coins;
  p.totals.questsDone = (p.totals.questsDone ?? 0) + 1;
  return q.coins;
}

// Pays the diamonds for finishing all of today's quests. Returns the diamonds, or 0.
export function claimQuestBonus(p) {
  const quests = todayQuests(p);
  if (quests.bonus || !quests.list.every((q) => q.claimed)) return 0;
  quests.bonus = true;
  p.diamonds += QUEST_BONUS;
  return QUEST_BONUS;
}

// A badge's lifetime count. Stars, kills, the best Endless wave and the heroes come from the save itself.
export function badgeStat(p, stat) {
  if (stat === 'stars') return totalStars(p);
  if (stat === 'kills') return p.kills;
  if (stat === 'endlessBest') return p.endlessBest;
  if (stat === 'heroes') return Object.keys(p.heroes).length;
  return p.totals[stat] ?? 0;
}

export const badgeReady = (p, b) => !p.badges.includes(b.id) && badgeStat(p, b.stat) >= b.need;

// Pays a badge. Returns the diamonds, or 0.
export function claimBadge(p, id) {
  const b = BADGES.find((x) => x.id === id);
  if (!b || !badgeReady(p, b)) return 0;
  p.badges.push(b.id);
  p.diamonds += b.diamonds;
  return b.diamonds;
}

// How many rewards wait to be collected (the dot on the Rewards button)
export function rewardsWaiting(p) {
  const quests = p.quests?.day === dayKey() ? p.quests : { list: [], bonus: true };
  const done = quests.list.filter((q) => !q.claimed && q.have >= q.need).length;
  const bonus = !quests.bonus && quests.list.length && quests.list.every((q) => q.claimed) ? 1 : 0;
  return done + bonus + BADGES.filter((b) => badgeReady(p, b)).length;
}
