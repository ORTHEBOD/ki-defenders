import { Online } from './Online.js';
import { HEROES, SKILL_TREE, newHeroSave } from '../data/hero.js';
import { GEAR } from '../data/shop.js';

// Player profiles. Each player has a name and a 4-digit PIN.
// Progress is always saved on this device first (localStorage), so the game works offline,
// and then copied to the online server whenever there is internet (see Sync below).
// If storage is blocked (private mode), it falls back to memory for this session.
//
// A saved record: { pin (hash), data, token (online key), dirty (not uploaded yet), online ('ok' | 'taken') }

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

// New players start with no hero: heroes are won in the Lucky Spin
function newPlayer(name) {
  return migrate({ name, heroes: {}, activeHero: null, stars: {}, kills: 0, createdAt: Date.now(), updatedAt: Date.now() });
}

// The tester account: this name gets every level, hero, item and lots of coins.
// It is only ever saved on this device - never online, never on the leaderboard.
export const SUPER_NAME = 'supertester';

function superPlayer(name) {
  const p = newPlayer(name);
  p.super = true;
  p.coins = 999999;
  const skills = SKILL_TREE.reduce((n, b) => n + b.skills.length, 0);
  for (const id of Object.keys(HEROES)) p.heroes[id] = { ...newHeroSave(), level: skills + 1 };
  p.activeHero = 'zenko';
  p.items = Object.keys(GEAR);
  return p;
}

// Brings older saves up to date (adds coins, the hero list, gear and so on)
function migrate(p) {
  if (!p.heroes) {
    p.heroes = { zenko: { level: 1, xp: 0, skills: [], ...(p.hero || {}) } };
    delete p.hero;
  }
  for (const h of Object.values(p.heroes)) h.gear ??= {};
  // The tester keeps enough levels for every skill, also when new skills are added
  if (p.super) {
    const skills = SKILL_TREE.reduce((n, b) => n + b.skills.length, 0);
    for (const h of Object.values(p.heroes)) h.level = Math.max(h.level, skills + 1);
  }
  if (!p.heroes[p.activeHero]) p.activeHero = Object.keys(p.heroes)[0] ?? null;
  p.coins ??= 0;
  p.items ??= [];
  p.endlessBest ??= 0;
  p.seenStory ??= [];
  // Players who already won a level don't need the Level 1 tutorial
  p.tutorialDone ??= Object.keys(p.stars ?? {}).length > 0;
  p.daily ??= { last: null, streak: 0 };
  p.updatedAt ??= 0;
  return p;
}

export const Save = {
  players() {
    return Object.values(readAll()).map((p) => p.data.name);
  },

  // Logs in (online when possible), or creates the player if the name is new.
  // The newest copy of the progress wins: the one on this device or the one online.
  async login(name, pin) {
    const clean = name.trim();
    const key = clean.toLowerCase();
    const all = readAll();
    const hash = await hashPin(key, pin);
    const local = all[key];
    if (local && !local.pin && local.google) return { ok: false, error: 'This player signs in with Google.' };
    if (local && local.pin !== hash) return { ok: false, error: 'Wrong PIN for this player.' };

    if (key === SUPER_NAME) {
      if (!local) all[key] = { pin: hash, data: superPlayer(clean), online: 'local' };
      writeAll(all);
      setCurrentKey(key);
      return { ok: true, created: !local, online: false };
    }

    const res = await Online.login(clean, pin, local ? migrate(local.data) : undefined);
    if (res?.ok) {
      const remote = res.data ? migrate(res.data) : null;
      let data = remote;
      let dirty = false;
      if (!remote) {
        data = local ? local.data : newPlayer(res.name ?? clean);
        dirty = true;
      } else if (local && (local.data.updatedAt ?? 0) > (remote.updatedAt ?? 0)) {
        data = local.data;
        dirty = true;
      }
      all[key] = { pin: hash, data, token: res.token, dirty, online: 'ok' };
      writeAll(all);
      setCurrentKey(key);
      if (dirty) Sync.soon(200);
      return { ok: true, created: !local && !remote, online: true };
    }
    if (res?.error === 'locked') return { ok: false, error: `Too many wrong PINs. Try again in ${res.minutes} min.` };
    if (res?.error === 'wrong_pin') {
      if (!local) return { ok: false, error: 'Wrong PIN for this player.' };
      // Someone else owns this name online: keep playing, saved on this device only
      local.online = 'taken';
      writeAll(all);
      setCurrentKey(key);
      return { ok: true, created: false, online: false };
    }

    // No internet (or no server): play on this device, and upload later
    let created = false;
    if (!local) {
      all[key] = { pin: hash, data: newPlayer(clean), dirty: true };
      writeAll(all);
      created = true;
    }
    setCurrentKey(key);
    return { ok: true, created, online: false };
  },

  // Signs in with a Google account (needs internet). The first time, the server asks for a name:
  // then this returns { ok: false, needName: true } and the game asks the player and calls again.
  async loginGoogle(idToken, name, pin) {
    const all = readAll();
    const guess = name ? all[name.trim().toLowerCase()] : null;
    const res = await Online.google(idToken, name?.trim(), pin, guess ? migrate(guess.data) : undefined);
    if (!res) return { ok: false, error: 'No internet - Google sign-in needs a connection.' };
    if (!res.ok) {
      const error = {
        need_name: null,
        taken: 'That name is taken. Enter its PIN to link it, or pick another name.',
        wrong_pin: 'Wrong PIN for this player.',
        locked: `Too many wrong PINs. Try again in ${res.minutes} min.`,
        bad_google: 'Google sign-in failed. Please try again.',
        google_off: 'Google sign-in is not set up yet.',
      }[res.error] ?? 'Something went wrong. Please try again.';
      return res.error === 'need_name' ? { ok: false, needName: true } : { ok: false, error };
    }
    const key = res.name.toLowerCase();
    const local = all[key];
    const remote = res.data ? migrate(res.data) : null;
    let data = remote;
    let dirty = false;
    if (!remote) {
      data = local ? local.data : newPlayer(res.name);
      dirty = true;
    } else if (local && (local.data.updatedAt ?? 0) > (remote.updatedAt ?? 0)) {
      data = local.data;
      dirty = true;
    }
    all[key] = { pin: local?.pin ?? null, google: true, data, token: res.token, dirty, online: 'ok' };
    writeAll(all);
    setCurrentKey(key);
    if (dirty) Sync.soon(200);
    return { ok: true, created: res.created, name: res.name };
  },

  current() {
    const key = getCurrentKey();
    const all = readAll();
    return key && all[key] ? migrate(all[key].data) : null;
  },

  // Every player on this device (for the leaderboard when offline)
  allPlayers() {
    return Object.values(readAll()).map((p) => migrate(p.data));
  },

  update(fn) {
    const key = getCurrentKey();
    const all = readAll();
    if (!key || !all[key]) return null;
    const data = migrate(all[key].data);
    const result = fn(data);
    data.updatedAt = Date.now();
    all[key].dirty = true;
    writeAll(all);
    Sync.soon();
    return result;
  },

  logout() {
    setCurrentKey(null);
  },
};

// ---------- Online sync ----------

let syncTimer = null;
let syncing = false;
const listeners = new Set();

export const Sync = {
  // 'online' (saved online), 'pending' (waiting to upload), 'login' (log in again with internet),
  // 'taken' (name used by someone else online), or null (nobody logged in)
  status() {
    const rec = readAll()[getCurrentKey()];
    if (!rec) return null;
    if (rec.online === 'local') return 'local';
    if (rec.online === 'taken') return 'taken';
    if (!rec.token) return 'login';
    return rec.dirty ? 'pending' : 'online';
  },

  onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  soon(delay = 1500) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => this.now(), delay);
  },

  async now() {
    const key = getCurrentKey();
    const rec = readAll()[key];
    if (syncing || !rec || !rec.dirty || !rec.token || rec.online === 'taken' || rec.online === 'local') return;
    syncing = true;
    const sent = rec.data.updatedAt;
    const res = await Online.save(rec.data.name, rec.token, rec.data);
    syncing = false;
    const all = readAll();
    const now = all[key];
    if (!now) return;
    if (res?.ok) {
      // Only clear the flag if nothing changed while uploading
      if (now.data.updatedAt === sent) now.dirty = false;
      else this.soon();
    } else if (res?.error === 'bad_token') {
      now.token = null;
    }
    writeAll(all);
    listeners.forEach((fn) => fn(this.status()));
  },
};

// Upload anything waiting as soon as the internet comes back
if (typeof window !== 'undefined') window.addEventListener('online', () => Sync.now());

export function totalStars(player) {
  return Object.values(player.stars).reduce((a, b) => a + b, 0);
}

// The saved data of the hero the player is using now (null before the first hero is won)
export function activeHero(player) {
  return player.heroes[player.activeHero] ?? null;
}
