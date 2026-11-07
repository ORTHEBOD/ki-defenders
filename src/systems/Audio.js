import { Settings } from './Settings.js';

// Music and sound effects, made by a tiny synthesizer (no audio files, so it all works offline).
// Browsers only allow sound after the first tap, so main.js calls Audio.unlock() on the first tap.
//
// A song is a list of notes, one token per step: 'A4' plays a note, '_' holds it, '-' is silence.

const SONGS = {
  menu: {
    bpm: 100, perBeat: 2,
    lead: 'E4 G4 C5 _ B4 G4 A4 _ F4 A4 C5 _ D5 C5 A4 _ G4 _ E4 G4 C5 _ E5 _ D5 _ C5 B4 C5 _ _ -',
    bass: 'C3 _ _ _ G2 _ _ _ F2 _ _ _ A2 _ _ _ C3 _ _ _ E3 _ _ _ G2 _ _ _ G2 _ _ _',
    kick: 'x---x---', snare: '--------', hat: '--x---x-',
    leadVol: 0.05,
  },
  battle: {
    bpm: 140, perBeat: 4,
    lead: 'A4 _ _ - C5 _ E5 _ D5 _ C5 _ B4 _ G4 _ A4 _ _ _ E4 _ A4 _ B4 _ C5 _ D5 _ _ _ '
      + 'E5 _ _ - D5 _ C5 _ D5 _ E5 _ G5 _ E5 _ A5 _ _ _ G5 _ E5 _ D5 _ C5 _ B4 _ _ _',
    bass: 'A2 - A3 - A2 - A3 - A2 - A3 - A2 - A3 - F2 - F3 - F2 - F3 - F2 - F3 - F2 - F3 - '
      + 'C3 - C4 - C3 - C4 - C3 - C4 - C3 - C4 - G2 - G3 - G2 - G3 - G2 - G3 - G2 - G3 -',
    kick: 'x-------x-x-----', snare: '----x-------x---', hat: 'x-x-x-x-x-x-x-x-',
    leadVol: 0.045,
  },
  boss: {
    bpm: 155, perBeat: 4,
    lead: 'D5 _ - D5 F5 _ D5 _ C5 _ A4 _ C5 _ D5 _ A#4 _ - A#4 D5 _ A#4 _ A4 _ G4 _ A4 _ C#5 _',
    bass: 'D2 D2 D3 D2 D2 D2 D3 D2 D2 D2 D3 D2 D2 D2 D3 D2 A#1 A#1 A#2 A#1 A#1 A#1 A#2 A#1 A1 A1 A2 A1 A1 A1 A2 A1',
    kick: 'x---x---x---x-x-', snare: '----x-------x---', hat: 'xxxxxxxxxxxxxxxx',
    leadVol: 0.045,
  },
};

const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

function freq(token) {
  const m = /^([A-G]#?)(\d)$/.exec(token);
  if (!m) return 0;
  const midi = 12 * (Number(m[2]) + 1) + NOTE[m[1]];
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Turns 'A4 _ _ - C5' into [{ step, f, len }]
function parse(str) {
  const tokens = str.trim().split(/\s+/);
  const notes = [];
  tokens.forEach((t, i) => {
    if (t === '_' && notes.length && notes[notes.length - 1].end === i) {
      notes[notes.length - 1].len++;
      notes[notes.length - 1].end++;
    } else if (t !== '-' && t !== '_') {
      notes.push({ step: i, f: freq(t), len: 1, end: i + 1 });
    }
  });
  return { notes, length: tokens.length };
}

let ctx = null;
let master;
let musicGain;
let sfxGain;
let noise;
let song = null;
let wanted = null;
let timer = null;
let nextTime = 0;
let step = 0;
const lastSfx = {};

function setup() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain();
  master.connect(ctx.destination);
  musicGain = ctx.createGain();
  sfxGain = ctx.createGain();
  musicGain.connect(master);
  sfxGain.connect(master);
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  Audio.applyVolumes();
  return true;
}

function tone(type, f, t, dur, vol, dest, slideTo) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function burst(t, dur, vol, dest, filter = 'highpass', cutoff = 1500) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const f = ctx.createBiquadFilter();
  f.type = filter;
  f.frequency.value = cutoff;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(dest);
  src.start(t);
  src.stop(t + dur + 0.02);
}

function playStep(s, t) {
  const stepDur = 60 / s.bpm / s.perBeat;
  const li = step % s.lead.length;
  for (const n of s.lead.notes) if (n.step === li) tone('square', n.f, t, n.len * stepDur * 0.95, s.leadVol, musicGain);
  const bi = step % s.bass.length;
  for (const n of s.bass.notes) if (n.step === bi) tone('triangle', n.f, t, n.len * stepDur * 0.9, 0.12, musicGain);
  const at = (pat) => pat[step % pat.length] === 'x';
  if (at(s.kick)) tone('sine', 140, t, 0.14, 0.35, musicGain, 40);
  if (at(s.snare)) burst(t, 0.12, 0.12, musicGain, 'highpass', 1500);
  if (at(s.hat)) burst(t, 0.035, 0.04, musicGain, 'highpass', 7000);
}

function tick() {
  if (!song || !ctx) return;
  const stepDur = 60 / song.bpm / song.perBeat;
  while (nextTime < ctx.currentTime + 0.15) {
    playStep(song, nextTime);
    nextTime += stepDur;
    step++;
  }
}

// Each sound effect: what it plays. `now` is the start time.
const SFX = {
  click: (t) => tone('square', 880, t, 0.05, 0.05, sfxGain),
  punch: (t) => burst(t, 0.06, 0.12, sfxGain, 'lowpass', 900),
  beam: (t) => tone('sawtooth', 1200, t, 0.18, 0.05, sfxGain, 300),
  blast: (t) => { tone('square', 500, t, 0.08, 0.04, sfxGain, 200); burst(t + 0.05, 0.15, 0.1, sfxGain, 'lowpass', 700); },
  flash: (t) => tone('sine', 1600, t, 0.2, 0.05, sfxGain, 600),
  hero: (t) => tone('square', 700, t, 0.07, 0.04, sfxGain, 350),
  pop: (t) => tone('sine', 520, t, 0.08, 0.06, sfxGain, 900),
  coin: (t) => { tone('square', 988, t, 0.06, 0.04, sfxGain); tone('square', 1319, t + 0.06, 0.12, 0.04, sfxGain); },
  build: (t) => { tone('triangle', 392, t, 0.1, 0.12, sfxGain); tone('triangle', 523, t + 0.07, 0.14, 0.12, sfxGain); },
  upgrade: (t) => [523, 659, 784].forEach((f, i) => tone('square', f, t + i * 0.06, 0.1, 0.05, sfxGain)),
  transform: (t) => {
    tone('sawtooth', 200, t, 0.6, 0.06, sfxGain, 1200);
    [523, 659, 784, 1047].forEach((f, i) => tone('square', f, t + 0.3 + i * 0.07, 0.25, 0.05, sfxGain));
  },
  wave: (t) => { tone('square', 392, t, 0.15, 0.06, sfxGain); tone('square', 523, t + 0.15, 0.3, 0.06, sfxGain); },
  boss: (t) => { tone('sawtooth', 110, t, 0.9, 0.12, sfxGain, 55); burst(t, 0.6, 0.08, sfxGain, 'lowpass', 400); },
  ability: (t) => { tone('sawtooth', 300, t, 0.35, 0.07, sfxGain, 1400); burst(t + 0.1, 0.3, 0.06, sfxGain, 'bandpass', 2000); },
  explode: (t) => { burst(t, 0.5, 0.25, sfxGain, 'lowpass', 500); tone('sine', 120, t, 0.4, 0.2, sfxGain, 40); },
  stun: (t) => tone('square', 1500, t, 0.25, 0.04, sfxGain, 800),
  heal: (t) => tone('sine', 660, t, 0.25, 0.04, sfxGain, 990),
  hurt: (t) => burst(t, 0.15, 0.12, sfxGain, 'lowpass', 300),
  victory: (t) => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone('square', f, t + i * 0.12, 0.22, 0.06, sfxGain)),
  defeat: (t) => [392, 330, 262, 196].forEach((f, i) => tone('triangle', f, t + i * 0.2, 0.35, 0.12, sfxGain)),
  spin: (t) => tone('square', 1200, t, 0.03, 0.03, sfxGain),
  win: (t) => [784, 988, 1175, 1568].forEach((f, i) => tone('square', f, t + i * 0.09, 0.2, 0.06, sfxGain)),
};

export const Audio = {
  // Call from a tap: creates or wakes up the sound system
  unlock() {
    if (!ctx && !setup()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (wanted && !song) this.music(wanted);
  },

  applyVolumes() {
    if (!ctx) return;
    musicGain.gain.value = Settings.get('music') * 0.9;
    sfxGain.gain.value = Settings.get('sfx');
  },

  // Starts a song by name ('menu', 'battle', 'boss'). Keeps playing if it is already on.
  music(name) {
    wanted = name;
    if (!ctx) return;
    if (song && song.name === name) return;
    const def = SONGS[name];
    song = { ...def, name, lead: parse(def.lead), bass: parse(def.bass) };
    step = 0;
    nextTime = ctx.currentTime + 0.05;
    if (!timer) timer = setInterval(tick, 25);
  },

  stopMusic() {
    wanted = null;
    song = null;
  },

  // Plays a sound effect. The same sound plays at most once every `gap` seconds.
  sfx(name, gap = 0.05) {
    if (!ctx || ctx.state !== 'running' || Settings.get('sfx') <= 0) return;
    const now = ctx.currentTime;
    if (lastSfx[name] && now - lastSfx[name] < gap) return;
    lastSfx[name] = now;
    SFX[name]?.(now);
  },
};
