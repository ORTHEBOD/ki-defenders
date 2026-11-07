// Player profiles saved on this device (localStorage).
// Each player has a name and a 4-digit PIN. Online sync comes later (Phase 7).
// If storage is blocked (private mode), it falls back to memory for this session.

const KEY = 'kd_profiles_v1';
const CURRENT = 'kd_current_v1';

let memory = {};
let memoryCurrent = null;

function readAll() {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : memory;
  } catch (e) {
    return memory;
  }
}

function writeAll(all) {
  memory = all;
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch (e) {
    // Storage blocked: keep it in memory only
  }
}

function getCurrentKey() {
  try {
    return localStorage.getItem(CURRENT) ?? memoryCurrent;
  } catch (e) {
    return memoryCurrent;
  }
}

function setCurrentKey(key) {
  memoryCurrent = key;
  try {
    if (key) localStorage.setItem(CURRENT, key);
    else localStorage.removeItem(CURRENT);
  } catch (e) {
    // Storage blocked: memory only
  }
}

async function hashPin(key, pin) {
  const bytes = new TextEncoder().encode(`kd:${key}:${pin}`);
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function newPlayer(name) {
  return migrate({ name, stars: {}, kills: 0, createdAt: Date.now() });
}

// Brings older saves up to date (adds coins, the hero list, gear and so on)
function migrate(p) {
  if (!p.heroes) {
    p.heroes = { zenko: { level: 1, xp: 0, skills: [], ...(p.hero || {}) } };
    delete p.hero;
  }
  for (const h of Object.values(p.heroes)) h.gear ??= {};
  p.activeHero ??= 'zenko';
  p.coins ??= 0;
  p.items ??= [];
  p.endlessBest ??= 0;
  p.seenStory ??= [];
  return p;
}

export const Save = {
  players() {
    return Object.values(readAll()).map((p) => p.data.name);
  },

  // Logs in, or creates the player if the name is new
  async login(name, pin) {
    const clean = name.trim();
    const key = clean.toLowerCase();
    const all = readAll();
    const hash = await hashPin(key, pin);
    let created = false;
    if (all[key]) {
      if (all[key].pin !== hash) return { ok: false, error: 'Wrong PIN for this player.' };
    } else {
      all[key] = { pin: hash, data: newPlayer(clean) };
      writeAll(all);
      created = true;
    }
    setCurrentKey(key);
    return { ok: true, created };
  },

  current() {
    const key = getCurrentKey();
    const all = readAll();
    return key && all[key] ? migrate(all[key].data) : null;
  },

  // Every player on this device (for the leaderboard)
  allPlayers() {
    return Object.values(readAll()).map((p) => migrate(p.data));
  },

  update(fn) {
    const key = getCurrentKey();
    const all = readAll();
    if (!key || !all[key]) return null;
    const result = fn(migrate(all[key].data));
    writeAll(all);
    return result;
  },

  logout() {
    setCurrentKey(null);
  },
};

export function totalStars(player) {
  return Object.values(player.stars).reduce((a, b) => a + b, 0);
}

// The saved data of the hero the player is using now
export function activeHero(player) {
  return player.heroes[player.activeHero] ?? player.heroes.zenko;
}
