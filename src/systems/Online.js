// Talks to the online server (netlify/functions/api.mjs).
// Every call gives up after a few seconds and returns null when there is no internet,
// so the game keeps working offline.

// Where the server lives. On Netlify (and a local test server) the game and the server share
// one address. Everywhere else - GitHub Pages, the Android app, the PC app - the game talks
// to the Netlify one.
const NETLIFY_SITE = 'https://ki-defenders.netlify.app';
const sameSite = location.hostname.endsWith('netlify.app')
  || (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && location.port !== '');
const API = sameSite ? '/api' : `${NETLIFY_SITE}/api`;

async function call(method, route, body, timeout = 7000) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(`${API}/${route}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
      cache: 'no-store',
    });
    const json = await res.json().catch(() => null);
    // No server here (e.g. a plain file host): treat it like being offline
    if (!json || typeof json.ok !== 'boolean') return null;
    return json;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export const Online = {
  login(name, pin, data) {
    return call('POST', 'login', { name, pin, data });
  },

  google(idToken, name, pin, data) {
    return call('POST', 'google', { idToken, name, pin, data }, 12000);
  },

  save(name, token, data) {
    return call('POST', 'save', { name, token, data });
  },

  leaderboard() {
    return call('GET', 'leaderboard');
  },

  rename(name, token, newName, data) {
    return call('POST', 'rename', { name, token, newName, data });
  },

  feedback(message) {
    return call('POST', 'feedback', message);
  },
};
