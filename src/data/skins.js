// Fighter skins: a new color for a fighter, bought with diamonds on the Fighters page.
// A skin repaints the fighter's pictures in code (src/art/skins.js): every color except the skin,
// the eyes and the dark outline is painted along `colors`, from the darkest to the lightest.

export const SKINS = {
  golden: { name: 'Golden', colors: [0x3a2400, 0xa8740a, 0xffd23b, 0xfff6c0], price: 25 },
  shadow: { name: 'Shadow', colors: [0x07060c, 0x2a1a44, 0x6a3ab8, 0xd2a8ff], price: 20 },
  ice: { name: 'Ice', colors: [0x0a2440, 0x2f7fc0, 0x8fe0ff, 0xf2fdff], price: 20 },
  inferno: { name: 'Inferno', colors: [0x2a0500, 0xa8200a, 0xff6a1a, 0xffe08a], price: 20 },
  jade: { name: 'Jade', colors: [0x032a18, 0x14804a, 0x5be38b, 0xe6fff0], price: 15 },
};

// Which skins each fighter can wear
export const FIGHTER_SKINS = {
  kaito: ['golden', 'shadow', 'ice'],
  ronin: ['shadow', 'ice', 'jade'],
  blaze: ['ice', 'golden', 'shadow'],
  lumi: ['inferno', 'jade', 'golden'],
  oru: ['golden', 'shadow', 'jade'],
};
