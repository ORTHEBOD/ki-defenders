// The weekly Endless leaderboard. It starts again every Monday at 10:00 (Israel time), and the
// top 20 of the week that ended win diamonds. The game and the online server both use this file.

export const WEEK_ZONE = 'Asia/Jerusalem';
export const WEEK_DAY = 1; // Monday (0 = Sunday)
export const WEEK_HOUR = 10;

// Diamonds for each place (1st, 2nd, ...). Places after the last one win nothing.
export const WEEK_PRIZES = [100, 50, 50, 10, 10, 10, 10, 10, 10, 10, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

const DAY = 86400000;

// The clock in the leaderboard's time zone, as if it were UTC (so getUTC... reads local values)
function zoneClock(ms) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: WEEK_ZONE, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(ms));
  const v = Object.fromEntries(parts.map((p) => [p.type, Number(p.value)]));
  return Date.UTC(v.year, v.month - 1, v.day, v.hour, v.minute, v.second);
}

// The real moment of a zone clock time (corrects once for summer time)
function fromZoneClock(clock) {
  let ms = clock - (zoneClock(clock) - clock);
  ms += clock - zoneClock(ms);
  return ms;
}

// When the week that `ms` falls in started: { id: '2026-11-09', start, end } (start/end in ms)
export function weekOf(ms = Date.now()) {
  const local = zoneClock(ms);
  const d = new Date(local);
  const back = (d.getUTCDay() - WEEK_DAY + 7) % 7;
  let startClock = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - back, WEEK_HOUR);
  if (startClock > local) startClock -= 7 * DAY;
  const id = new Date(startClock).toISOString().slice(0, 10);
  return { id, start: fromZoneClock(startClock), end: fromZoneClock(startClock + 7 * DAY) };
}

// The week before this one
export function lastWeek(ms = Date.now()) {
  return weekOf(weekOf(ms).start - 1000);
}

// More waves first; on the same wave, the one who got there faster
export function compareScores(a, b) {
  return b.wave - a.wave || a.time - b.time;
}

// "12:34" or "1:02:03" from seconds
export function formatTime(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}
