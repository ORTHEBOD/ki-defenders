// The game's online server (a Netlify Function). Saves each player's progress and keeps the
// shared Endless leaderboard, using Netlify Blobs as storage.
//
//   POST /api/login        { name, pin, data? }   -> { ok, token, created, data }
//   POST /api/save         { name, token, data }  -> { ok, updatedAt }
//   GET  /api/leaderboard                          -> { ok, rows }
//   GET  /api/ping                                 -> { ok }
//
// PINs are stored only as salted hashes. After 5 wrong PINs a name is locked for 15 minutes.

import { getStore } from '@netlify/blobs';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const MAX_DATA = 200_000; // bytes of save data
const HEROES = ['zenko', 'mira', 'goran', 'sora'];

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

// Keeps the top 100 Endless results. Numbers are clamped so a broken save can't spoil the board.
async function updateLeaderboard(s, name, data) {
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

  if (user.lockUntil > Date.now()) {
    return reply({ ok: false, error: 'locked', minutes: Math.ceil((user.lockUntil - Date.now()) / 60000) }, 429);
  }
  if (!sameHash(hashPin(user.salt, key, pin), user.pinHash)) {
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

async function leaderboard() {
  const rows = (await store().get('leaderboard', { type: 'json' })) ?? [];
  return reply({ ok: true, rows: rows.slice(0, 50) });
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  const route = new URL(req.url).pathname.replace(/^\/api\/?/, '');
  try {
    if (req.method === 'GET' && route === 'ping') return reply({ ok: true });
    if (req.method === 'GET' && route === 'leaderboard') return await leaderboard();
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      if (route === 'login') return await login(body);
      if (route === 'save') return await save(body);
    }
    return reply({ ok: false, error: 'not_found' }, 404);
  } catch (e) {
    console.error(e);
    return reply({ ok: false, error: 'server' }, 500);
  }
};

export const config = { path: '/api/*' };
