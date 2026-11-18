import { LEVELS, MAPS, mapOf } from '../data/levels.js';
import { FORM_LEVELS } from '../data/fighters.js';
import { totalStars } from './Save.js';

// Which maps and levels a player can play. Used by the level map and the "Next level" button.

const stars = (player, id) => player.stars[id] || 0;

// An area opens when the last level of the area before it is won AND the player has enough stars
export function mapOpen(player, i) {
  if (i === 0 || player.super) return true;
  return stars(player, MAPS[i].first - 1) > 0 && totalStars(player) >= MAPS[i].needStars;
}

// A level opens once the level before it has been won (the first level of an area opens with the area)
export function levelOpen(player, id) {
  if (!LEVELS.some((l) => l.id === id)) return false;
  const m = mapOf(id);
  if (!mapOpen(player, m)) return false;
  return player.super || id === MAPS[m].first || stars(player, id - 1) > 0;
}

// The highest fighter form opened by the story (0 = Base ... 5 = Ascended)
export function maxForm(player) {
  if (!player || player.super) return FORM_LEVELS.length - 1;
  const opened = FORM_LEVELS.filter((id) => id === 0 || stars(player, id) > 0).length - 1;
  return Math.max(opened, player.formsKept ?? 0);
}

// The shop and Endless mode open with stars
export const SHOP_STARS = 6;
export const ENDLESS_STARS = 15;

export function shopOpen(player) {
  return player.super || totalStars(player) >= SHOP_STARS;
}

export function endlessOpen(player) {
  return player.super || totalStars(player) >= ENDLESS_STARS;
}

// Better gear is sold as your heroes grow: Common from hero level 5, Rare from 10, Epic from 15,
// Legendary from 20, Mythic from 25 and Divine from 30.
// The highest level of any of the player's heroes counts.
export const GEAR_LEVELS = [5, 10, 15, 20, 25, 30];

export function gearTier(player) {
  if (player.super) return GEAR_LEVELS.length;
  const best = Math.max(0, ...Object.values(player.heroes ?? {}).map((h) => h.level));
  return GEAR_LEVELS.filter((lvl) => best >= lvl).length;
}

// What the player must do to see gear of this tier in the shop
export function tierNeed(tier) {
  return `Hero level ${GEAR_LEVELS[tier - 1]}`;
}
