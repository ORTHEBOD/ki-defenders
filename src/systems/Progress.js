import { LEVELS, MAPS } from '../data/levels.js';
import { totalStars } from './Save.js';

// Which maps and levels a player can play. Used by the level map and the "Next level" button.

const stars = (player, id) => player.stars[id] || 0;

// An area opens when the last level of the area before it is won AND the player has enough stars
export function mapOpen(player, i) {
  if (i === 0 || player.super) return true;
  return stars(player, i * 10) > 0 && totalStars(player) >= MAPS[i].needStars;
}

// A level opens once the level before it has been won (the first level of an area opens with the area)
export function levelOpen(player, id) {
  if (!LEVELS.some((l) => l.id === id)) return false;
  const m = Math.floor((id - 1) / 10);
  if (!mapOpen(player, m)) return false;
  return player.super || id % 10 === 1 || stars(player, id - 1) > 0;
}
