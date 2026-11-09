// "Sign in with Google". Gets a Google sign-in token (a signed note from Google saying who the
// player is); the online server checks it and opens that player's progress.
// - Website: Google's own button (Google Identity Services)
// - Android app: the native Google account picker (@capgo/capacitor-social-login)
// - PC app: not supported yet (Google blocks sign-in inside app windows)
import { GOOGLE_CLIENT_ID } from '../data/google.js';

const native = () => !!window.Capacitor?.isNativePlatform?.();
const plugin = () => window.Capacitor?.Plugins?.SocialLogin;
const electron = () => navigator.userAgent.includes('Electron');

let scriptLoad = null;
function loadScript() {
  scriptLoad ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptLoad = null;
      reject(new Error('offline'));
    };
    document.head.appendChild(s);
  });
  return scriptLoad;
}

export const Google = {
  available() {
    if (!GOOGLE_CLIENT_ID || electron()) return false;
    return native() ? !!plugin() : true;
  },

  // True when the game shows its own button (Android), false when Google draws it (website)
  isNative: native,

  // Website: draws Google's button inside `el`. onToken(idToken) runs after the player signs in.
  async renderButton(el, onToken, onError) {
    try {
      await loadScript();
    } catch (e) {
      onError?.('No internet - Google sign-in needs a connection.');
      return;
    }
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (r) => (r.credential ? onToken(r.credential) : onError?.('Google sign-in was cancelled.')),
    });
    window.google.accounts.id.renderButton(el, { theme: 'filled_blue', size: 'large', shape: 'pill', text: 'signin_with', width: 440 });
  },

  // Android: opens the Google account picker. Returns { token } or { error } (the reason, to show the player).
  // Email and profile are always asked for; passing `scopes` makes the plugin refuse to sign in.
  async signInNative() {
    const p = plugin();
    if (!p) return { error: 'Google sign-in is not in this app.' };
    try {
      await p.initialize({ google: { webClientId: GOOGLE_CLIENT_ID } });
      const res = await p.login({ provider: 'google', options: {} });
      const token = res?.result?.idToken;
      return token ? { token } : { error: 'Google did not send a sign-in token.' };
    } catch (e) {
      const msg = String(e?.message ?? e);
      if (/cancel/i.test(msg)) return { error: 'Google sign-in was cancelled.' };
      return { error: `Google sign-in failed: ${msg}` };
    }
  },
};
