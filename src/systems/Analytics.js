// Play stats for Google Analytics: how many players play each day, which levels they play, win or
// lose, and how far they get in Endless. Sends nothing while MEASUREMENT_ID is empty, and nothing
// for the tester account. Works on the website, in the Android app and in the PC app.
import { MEASUREMENT_ID } from '../data/analytics.js';
import { Save } from './Save.js';

let ready = false;

// A random id for this device, kept in the game's own storage (the apps can't keep Google's cookies)
function deviceId() {
  try {
    let id = localStorage.getItem('kd-device');
    if (!id) {
      id = `${Math.floor(Math.random() * 1e9)}.${Date.now()}`;
      localStorage.setItem('kd-device', id);
    }
    return id;
  } catch (e) {
    return `${Math.floor(Math.random() * 1e9)}.${Date.now()}`;
  }
}

function platform() {
  if (navigator.userAgent.includes('Electron')) return 'pc';
  if (window.Capacitor?.isNativePlatform?.()) return 'android';
  return 'web';
}

export const Analytics = {
  start() {
    if (!MEASUREMENT_ID || ready) return;
    ready = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, { client_storage: 'none', client_id: deviceId(), platform: platform() });
    window.gtag('set', 'user_properties', { platform: platform() });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(s);
  },

  event(name, params = {}) {
    if (!ready || Save.current()?.super) return;
    window.gtag('event', name, params);
  },
};
