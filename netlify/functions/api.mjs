// The game's online server (a Netlify Function). Saves each player's progress and keeps the
// shared Endless leaderboard, using Netlify Blobs as storage.
//
//   POST /api/login        { name, pin, data? }   -> { ok, token, created, data }
//   POST /api/save         { name, token, data }  -> { ok, updatedAt }
//   GET  /api/leaderboard                          -> { ok, rows }
//   GET  /api/ping                                 -> { ok }
//   POST /api/google       { idToken, name?, pin? } -> { ok, token, created, data, name } or { ok:false, error:'need_name' }
//        Signs in with a Google account. The first time, the player picks a new name, or links
//        an existing player by giving its name and PIN.
//   POST /api/rename       { name, token, newName, data } -> { ok, name }
//        Moves a player to a new name (PIN, Google link and leaderboard place come along).
//   POST /api/feedback     { name, kind, text, platform } -> { ok }
//        A tip or a bug report from a player (kind: 'tip' or 'bug'). Saved as feedback/<time>.
//   GET  /api/feedback?key=FEEDBACK_KEY            -> { ok, rows }  (newest first)
//        For the game's maker. Works only when the FEEDBACK_KEY setting is set on Netlify.
//
// PINs are stored only as salted hashes. The hash uses the key of the player's first name
// (`pinKey`), so a renamed player keeps the same PIN. After 5 wrong PINs a name is locked for 15 minutes.

import { getStore } from '@netlify/blobs';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { GOOGLE_CLIENT_ID } from '../../src/data/google.js';

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const MAX_DATA = 200_000; // bytes of save data
const HEROES = ['zenko', 'mira', 'goran', 'sora'];
// Google sign-in tokens must be made for the game's client ID (src/data/google.js).
// More IDs can be added with the GOOGLE_CLIENT_IDS environment variable (comma separated).
const GOOGLE_CLIENT_IDS = [GOOGLE_CLIENT_ID, ...(process.env.GOOGLE_CLIENT_IDS ?? '').split(',')]
  .map((v) => v.trim()).filter(Boolean);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const reply = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS },
});

const store = () => getStore({ name: 'ki-defenders', consistency: 'strong' });

function cleanName(name) {
  const n = String(name ?? '').trim();
  return /^[\p{L}\p{N} _-]{2,12}$/u.test(n) ? n : null;
}

const userKey = (name) => `user/${encodeURIComponent(name.toLowerCase())}`;

function hashPin(salt, key, pin) {
  return createHash('sha256').update(`${salt}:${key}:${pin}`).digest('hex');
}

function sameHash(a, b) {
  const x = Buffer.from(a, 'hex');
  const y = Buffer.from(b, 'hex');
  return x.length === y.length && timingSafeEqual(x, y);
}

function validData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  return JSON.stringify(data).length <= MAX_DATA;
}

function newToken(user) {
  const token = randomBytes(24).toString('hex');
  user.tokens = [token, ...(user.tokens ?? [])].slice(0, 5);
  return token;
}

// The game's tester account has every level and hero, so it is never on the leaderboard
const TESTER = 'supertester';

// Keeps the top 100 Endless results. Numbers are clamped so a broken save can't spoil the board.
async function updateLeaderboard(s, name, data) {
  if (name.toLowerCase() === TESTER || data.super) return;
  const stars = Object.values(data.stars ?? {}).reduce((a, b) => a + (Number(b) || 0), 0);
  const row = {
    name,
    wave: Math.max(0, Math.min(10000, Math.floor(Number(data.endlessBest) || 0))),
    stars: Math.max(0, Math.min(90, stars)),
    hero: HEROES.includes(data.activeHero) ? data.activeHero : 'zenko',
  };
  const rows = ((await s.get('leaderboard', { type: 'json' })) ?? []).filter((r) => r.name.toLowerCase() !== name.toLowerCase());
  rows.push(row);
  rows.sort((a, b) => b.wave - a.wave || b.stars - a.stars);
  await s.setJSON('leaderboard', rows.slice(0, 100));
}

async function login(body) {
  const name = cleanName(body.name);
  const pin = String(body.pin ?? '');
  if (!name || !/^\d{4}$/.test(pin)) return reply({ ok: false, error: 'bad_input' }, 400);
  const s = store();
  const key = userKey(name);
  const user = await s.get(key, { type: 'json' });

  if (!user) {
    // A new player. If they already played on this device, their progress comes along.
    const data = validData(body.data) ? body.data : null;
    const salt = randomBytes(16).toString('hex');
    const fresh = { name, salt, pinHash: hashPin(salt, key, pin), fails: 0, lockUntil: 0, data, updatedAt: data?.updatedAt ?? 0 };
    const token = newToken(fresh);
    await s.setJSON(key, fresh);
    if (data) await updateLeaderboard(s, name, data);
    return reply({ ok: true, created: true, token, data });
  }

  if (!user.pinHash) return reply({ ok: false, error: 'google_only' }, 401);
  if (user.lockUntil > Date.now()) {
    return reply({ ok: false, error: 'locked', minutes: Math.ceil((user.lockUntil - Date.now()) / 60000) }, 429);
  }
  if (!sameHash(hashPin(user.salt, user.pinKey ?? key, pin), user.pinHash)) {
    user.fails = (user.fails ?? 0) + 1;
    if (user.fails >= MAX_FAILS) {
      user.fails = 0;
      user.lockUntil = Date.now() + LOCK_MS;
    }
    await s.setJSON(key, user);
    return reply({ ok: false, error: 'wrong_pin' }, 401);
  }
  user.fails = 0;
  user.lockUntil = 0;
  const token = newToken(user);
  await s.setJSON(key, user);
  return reply({ ok: true, created: false, token, data: user.data, name: user.name });
}

// Asks Google whether the sign-in token is real and made for this game. Returns the account id.
async function googleAccount(idToken) {
  if (typeof idToken !== 'string' || idToken.length > 4096 || !GOOGLE_CLIENT_IDS.length) return null;
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) return null;
  const t = await res.json();
  const issuer = t.iss === 'accounts.google.com' || t.iss === 'https://accounts.google.com';
  if (!issuer || !GOOGLE_CLIENT_IDS.includes(t.aud) || Number(t.exp) * 1000 < Date.now() || !t.sub) return null;
  return t.sub;
}

async function google(body) {
  if (!GOOGLE_CLIENT_IDS.length) return reply({ ok: false, error: 'google_off' }, 503);
  const sub = await googleAccount(body.idToken);
  if (!sub) return reply({ ok: false, error: 'bad_google' }, 401);
  const s = store();
  const linkKey = `google/${sub}`;
  const link = await s.get(linkKey, { type: 'json' });

  // Signed in with Google before: open that player
  if (link) {
    const key = userKey(link.name);
    const user = await s.get(key, { type: 'json' });
    if (user) {
      const token = newToken(user);
      await s.setJSON(key, user);
      return reply({ ok: true, created: false, token, data: user.data, name: user.name });
    }
  }

  // First time: the game must ask for a name (and a PIN, to link an existing player)
  const name = cleanName(body.name);
  if (!name) return reply({ ok: false, error: 'need_name' });
  const key = userKey(name);
  const user = await s.get(key, { type: 'json' });

  if (!user) {
    // A new player that signs in with Google only
    const data = validData(body.data) ? body.data : null;
    const fresh = { name, salt: null, pinHash: null, google: sub, fails: 0, lockUntil: 0, data, updatedAt: data?.updatedAt ?? 0 };
    const token = newToken(fresh);
    await s.setJSON(key, fresh);
    await s.setJSON(linkKey, { name });
    if (data) await updateLeaderboard(s, name, data);
    return reply({ ok: true, created: true, token, data, name });
  }

  // The name is taken: linking it needs its PIN (with the same lock as normal log in)
  const pin = String(body.pin ?? '');
  if (user.google && user.google !== sub) return reply({ ok: false, error: 'taken' }, 409);
  if (!user.pinHash || !/^\d{4}$/.test(pin)) return reply({ ok: false, error: 'taken' }, 409);
  if (user.lockUntil > Date.now()) {
    return reply({ ok: false, error: 'locked', minutes: Math.ceil((user.lockUntil - Date.now()) / 60000) }, 429);
  }
  if (!sameHash(hashPin(user.salt, user.pinKey ?? key, pin), user.pinHash)) {
    user.fails = (user.fails ?? 0) + 1;
    if (user.fails >= MAX_FAILS) {
      user.fails = 0;
      user.lockUntil = Date.now() + LOCK_MS;
    }
    await s.setJSON(key, user);
    return reply({ ok: false, error: 'wrong_pin' }, 401);
  }
  user.fails = 0;
  user.google = sub;
  const token = newToken(user);
  await s.setJSON(key, user);
  await s.setJSON(linkKey, { name: user.name });
  return reply({ ok: true, created: false, token, data: user.data, name: user.name });
}

async function save(body) {
  const name = cleanName(body.name);
  if (!name || typeof body.token !== 'string' || !validData(body.data)) return reply({ ok: false, error: 'bad_input' }, 400);
  const s = store();
  const key = userKey(name);
  const user = await s.get(key, { type: 'json' });
  if (!user || !(user.tokens ?? []).includes(body.token)) return reply({ ok: false, error: 'bad_token' }, 401);
  user.data = body.data;
  user.updatedAt = body.data.updatedAt ?? Date.now();
  await s.setJSON(key, user);
  await updateLeaderboard(s, user.name, body.data);
  return reply({ ok: true, updatedAt: user.updatedAt });
}

async function rename(body) {
  const name = cleanName(body.name);
  const newName = cleanName(body.newName);
  if (!name || !newName) return reply({ ok: false, error: 'bad_input' }, 400);
  if (newName.toLowerCase() === TESTER) return reply({ ok: false, error: 'taken' }, 409);
  const s = store();
  const key = userKey(name);
  const user = await s.get(key, { type: 'json' });
  if (!user || !(user.tokens ?? []).includes(body.token)) return reply({ ok: false, error: 'bad_token' }, 401);
  const newKey = userKey(newName);
  if (newKey !== key && (await s.get(newKey, { type: 'json' }))) return reply({ ok: false, error: 'taken' }, 409);
  user.pinKey ??= key;
  user.name = newName;
  if (validData(body.data)) {
    user.data = body.data;
    user.updatedAt = body.data.updatedAt ?? Date.now();
  }
  await s.setJSON(newKey, user);
  if (newKey !== key) await s.delete(key);
  if (user.google) await s.setJSON(`google/${user.google}`, { name: newName });
  const rows = ((await s.get('leaderboard', { type: 'json' })) ?? []).filter((r) => r.name.toLowerCase() !== name.toLowerCase());
  await s.setJSON('leaderboard', rows);
  if (user.data) await updateLeaderboard(s, newName, user.data);
  return reply({ ok: true, name: newName });
}

// Each player's device can send up to 10 messages an hour
async function feedback(body, req) {
  const kind = body.kind === 'bug' ? 'bug' : 'tip';
  const text = String(body.text ?? '').trim().slice(0, 1000);
  if (text.length < 3) return reply({ ok: false, error: 'short' }, 400);
  const s = store();
  const ip = req.headers.get('x-nf-client-connection-ip') ?? 'unknown';
  const hour = Math.floor(Date.now() / 3600000);
  const rateKey = `feedback-rate/${createHash('sha256').update(ip).digest('hex').slice(0, 16)}/${hour}`;
  const count = (await s.get(rateKey, { type: 'json' })) ?? 0;
  if (count >= 10) return reply({ ok: false, error: 'too_many' }, 429);
  await s.setJSON(rateKey, count + 1);
  const row = {
    time: new Date().toISOString(), kind, text,
    name: cleanName(body.name) ?? 'guest',
    platform: ['web', 'android', 'pc'].includes(body.platform) ? body.platform : 'web',
  };
  await s.setJSON(`feedback/${Date.now()}-${randomBytes(3).toString('hex')}`, row);
  return reply({ ok: true });
}

async function readFeedback(req) {
  const key = process.env.FEEDBACK_KEY;
  if (!key || new URL(req.url).searchParams.get('key') !== key) return reply({ ok: false, error: 'no' }, 403);
  const s = store();
  const { blobs } = await s.list({ prefix: 'feedback/' });
  const newest = blobs.map((b) => b.key).sort().reverse().slice(0, 200);
  const rows = await Promise.all(newest.map((k) => s.get(k, { type: 'json' })));
  return reply({ ok: true, rows: rows.filter(Boolean) });
}

async function leaderboard() {
  // Only players who have played Endless Battle are listed
  const rows = ((await store().get('leaderboard', { type: 'json' })) ?? []).filter((r) => r.wave > 0 && r.name.toLowerCase() !== TESTER);
  return reply({ ok: true, rows: rows.slice(0, 50) });
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  const route = new URL(req.url).pathname.replace(/^\/api\/?/, '');
  try {
    if (req.method === 'GET' && route === 'ping') return reply({ ok: true });
    if (req.method === 'GET' && route === 'leaderboard') return await leaderboard();
    if (req.method === 'GET' && route === 'feedback') return await readFeedback(req);
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      if (route === 'login') return await login(body);
      if (route === 'save') return await save(body);
      if (route === 'google') return await google(body);
      if (route === 'feedback') return await feedback(body, req);
      if (route === 'rename') return await rename(body);
    }
    return reply({ ok: false, error: 'not_found' }, 404);
  } catch (e) {
    console.error(e);
    return reply({ ok: false, error: 'server' }, 500);
  }
};

export const config = { path: '/api/*' };
