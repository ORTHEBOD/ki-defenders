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
];

// How big each picture is shown in battle (pixels). Bigger PNGs are shrunk to fit;
// menus and story scenes use the full-size picture.
const SIZES = {
  grunt: 48, runner: 48, flyer: 48, splitter: 48, medic: 48, brute: 56, splitling: 32,
  ogre: 80, scorpion: 80, mech: 80, krag: 100, sandKing: 100, vorn: 100, coin: 28,
};

export function artSize(key) {
  return SIZES[key] ?? 64;
}
