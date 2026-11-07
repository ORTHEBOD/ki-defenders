// Device settings (shared by every player on this device).

const KEY = 'kd_settings_v1';

const DEFAULTS = {
  music: 0.5, // 0..1
  sfx: 0.7, // 0..1
  damageNumbers: true,
  screenShake: true,
  startSpeed: 1, // 1, 2 or 3
};

let cache = null;

export const Settings = {
  get(key) {
    if (!cache) {
      cache = { ...DEFAULTS };
      try {
        Object.assign(cache, JSON.parse(localStorage.getItem(KEY) || '{}'));
      } catch (e) {
        // Storage blocked: defaults for this session
      }
    }
    return cache[key];
  },

  set(key, value) {
    this.get(key);
    cache[key] = value;
    try {
      localStorage.setItem(KEY, JSON.stringify(cache));
    } catch (e) {
      // Storage blocked: keep it for this session
    }
  },
};
