// AI art. To use a picture made with an AI image tool:
//   1. Save it as a PNG with a see-through background in the `art/` folder, named after its key
//      (for example art/kaito_0.png). ART_PROMPTS.md lists every key with a prompt.
//   2. Add the key to ART_FILES below.
// Anything not listed keeps the art drawn in code, so pictures can be added a few at a time.

export const ART_FILES = [
  // Kaito, all 6 forms, standing and punching
  'kaito_0', 'kaito_1', 'kaito_2', 'kaito_3', 'kaito_4', 'kaito_5',
  'kaito_0_attack', 'kaito_1_attack', 'kaito_2_attack', 'kaito_3_attack', 'kaito_4_attack', 'kaito_5_attack',
  // Ronin, all 6 forms, standing and firing his beam
  'ronin_0', 'ronin_1', 'ronin_2', 'ronin_3', 'ronin_4', 'ronin_5',
  'ronin_0_attack', 'ronin_1_attack', 'ronin_2_attack', 'ronin_3_attack', 'ronin_4_attack', 'ronin_5_attack',
  // Blaze (throwing fireballs), Lumi (light flash) and Master Oru (meditating), all 6 forms
  ...['blaze', 'lumi', 'oru'].flatMap((n) => [0, 1, 2, 3, 4, 5].flatMap((i) => [`${n}_${i}`, `${n}_${i}_attack`])),
  // The heroes, all 6 forms, standing, attacking and running (Sora has no running pictures: he runs standing)
  ...['zenko', 'mira', 'goran', 'sora'].flatMap((id) => [0, 1, 2, 3, 4, 5].flatMap((i) => [
    `hero_${id}_${i}`, `hero_${id}_${i}_attack`, ...(id === 'sora' ? [] : [`hero_${id}_${i}_run`])])),
  // Frozen Peaks and Volcano monsters (tools/cut_monsters.py), with their walking frames
  ...Object.entries({
    snowImp: 1, iceGolem: 2, frostBat: 2, yetiCub: 2, lavaSlime: 1, fireHound: 4, magmaBrute: 1, emberWisp: 2,
    frostGiant: 2, iceQueen: 2, lavaTitan: 2, pyrax: 2,
  }).flatMap(([k, n]) => [k, ...Array.from({ length: n - 1 }, (_, i) => `${k}_${i + 1}`)]),
];

// The base in battle and on the Base page: art/base_<walls level>.png (0-5) and art/cannon_<level>.png (1-5)
export const BASE_ART = [0, 1, 2, 3, 4, 5].map((i) => `base_${i}`).concat([1, 2, 3, 4, 5].map((i) => `cannon_${i}`));

// How big each picture is shown in battle (pixels). Bigger PNGs are shrunk to fit;
// menus and story scenes use the full-size picture.
const SIZES = {
  grunt: 48, runner: 48, flyer: 48, splitter: 48, medic: 48, brute: 56, splitling: 32,
  ogre: 80, scorpion: 80, mech: 80, krag: 100, sandKing: 100, vorn: 100, coin: 28,
  snowImp: 48, iceGolem: 56, frostBat: 56, yetiCub: 48, snowball: 32, lavaSlime: 52, fireHound: 58, magmaBrute: 56,
  emberWisp: 48, frostGiant: 80, lavaTitan: 80, iceQueen: 100, pyrax: 100,
};

export function artSize(key) {
  // A monster's walking frames (fireHound_2) are shown at its size
  return SIZES[key] ?? SIZES[key.replace(/_\d+$/, '')] ?? 64;
}
